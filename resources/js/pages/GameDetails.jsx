"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { RatingStars } from "../components/RatingStars";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewForm } from "../components/ReviewForm";
import {
    Calendar,
    Tag,
    Monitor,
    Plus,
    ChevronDown,
    ExternalLink,
    X,
} from "lucide-react";

// Componente para manejar descripciones inteligentes
const SmartDescription = ({ text, maxCollapsedChars = 300 }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  if (!text) return null;

  // Función mejorada para detectar secciones
  const detectSections = (content) => {
    // Detecta patrones comunes de títulos (palabras en mayúsculas, signos de exclamación, guiones)
    const sectionRegex = /(\n[A-Z][A-Z\s]+[!:-]|\n-{3,})/g;
    const sections = content.split(sectionRegex).filter(part => part.trim().length > 0);
    
    // Si no encuentra secciones claras, intenta dividir por párrafos largos
    if (sections.length <= 1) {
      return content.split(/(\n{2,})/g).filter(part => part.trim().length > 0);
    }
    return sections;
  };

  // Procesa el texto para limpiar caracteres HTML
  const cleanText = text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  const parts = detectSections(cleanText);
  
  // Si no hay secciones claras
  if (parts.length <= 1) {
    const shouldTruncate = cleanText.length > maxCollapsedChars && !expanded;
    const displayText = shouldTruncate 
      ? `${cleanText.substring(0, maxCollapsedChars)}...` 
      : cleanText;

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {displayText.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
        {cleanText.length > maxCollapsedChars && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-cyan-500 hover:text-cyan-400 font-medium mt-2"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    );
  }

  // Procesar secciones detectadas
  return (
    <div className="space-y-6">
      {parts.map((part, index) => {
        // Verificar si es un título (termina con !, : o ---)
        const isTitle = /[A-Z\s]+[!:-]|^-{3,}$/.test(part.trim());
        
        if (isTitle) {
          const sectionTitle = part.trim().replace(/[:!-]+$/, '').trim();
          const sectionContent = index + 1 < parts.length ? parts[index + 1] : '';
          const isExpanded = expandedSections[sectionTitle] !== false;
          const shouldTruncate = sectionContent.length > maxCollapsedChars;

          return (
            <div key={index} className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-bold text-lg text-cyan-500 mb-3">
                {sectionTitle}
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {sectionContent.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-3 last:mb-0">
                    {shouldTruncate && !isExpanded && i === 0
                      ? `${paragraph.substring(0, maxCollapsedChars)}...`
                      : paragraph}
                  </p>
                ))}
                {shouldTruncate && (
                  <button
                    onClick={() => setExpandedSections(prev => ({
                      ...prev,
                      [sectionTitle]: !isExpanded
                    }))}
                    className="text-cyan-500 hover:text-cyan-400 font-medium mt-2"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export function GameDetails() {
    const { slug } = useParams();
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const [game, setGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [isAddToListOpen, setIsAddToListOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchGameDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const [gameResponse, reviewsResponse] = await Promise.all([
                axios.get(`/api/games/${slug}`),
                axios.get(`/api/games/${slug}/reviews`),
            ]);

            const formattedReviews = reviewsResponse.data.map((review) => ({
                ...review,
                user: {
                    username: review.user.name,
                    name: review.user.name,
                    avatar: review.user.profile_pic,
                },
                content: review.text,
                rating: review.star_rating,
                likes_count: review.likes || 0,
                is_liked: review.is_liked || false,
            }));

            setGame(gameResponse.data);
            setReviews(formattedReviews);

            if (user && token) {
                fetchUserLists();
            }
        } catch (error) {
            console.error("Error fetching game details:", error);
            setError("Failed to load game details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [slug, user, token]);

    const fetchUserLists = async () => {
        try {
            const response = await axios.get(`/api/users/${user.name}/lists`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                withCredentials: true,
            });

            console.log("User lists response:", response.data);
            setUserLists(response.data || []);
        } catch (error) {
            console.error("Error fetching user lists:", error);
            setUserLists([]);
        }
    };

    useEffect(() => {
        fetchGameDetails();
    }, [fetchGameDetails]);

    const handleAddToList = async (listId) => {
        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.post(
                `/api/lists/${listId}/games`,
                { game_id: game.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 201) {
                setSuccessMessage("Game added to list!");
                setIsAddToListOpen(false);
            }
        } catch (error) {
            let errorMessage = "There was an error. Please try again.";

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        errorMessage = "Not authorized";
                        break;
                    case 404:
                        errorMessage = "List not found";
                        break;
                    case 409:
                        errorMessage = "Game already in list";
                        break;
                    case 500:
                        errorMessage = "Server error";
                        break;
                }
            }

            alert(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-cyan-500 mb-4"></div>
                    <div className="h-4 w-32 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Error</h2>
                <p className="mb-6 text-gray-400">{error}</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                    Game not found
                </h2>
                <p className="mb-6 text-gray-400">
                    The game you're looking for doesn't exist or has been
                    removed.
                </p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-100"
            } ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
        >
            {/* Game Header with gradient overlay */}
            <div className="relative">
                {game.background_image && (
                    <div className="absolute inset-0 h-96">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${game.background_image})`,
                                filter: "blur(8px) brightness(0.4)",
                                transform: "scale(1.1)",
                            }}
                        ></div>
                        <div
                            className={`absolute inset-0 bg-gradient-to-t ${
                                theme === "dark"
                                    ? "from-gray-900 via-gray-900/70"
                                    : "from-gray-100 via-gray-100/70"
                            } to-transparent`}
                        ></div>
                    </div>
                )}

                <div className="relative container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Game Cover */}
                        <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                            <div
                                className="relative overflow-hidden rounded-xl shadow-2xl transform transition-transform duration-500 hover:scale-105 cursor-pointer group"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    src={game.image_url || "/placeholder.svg"}
                                    alt={game.name}
                                    className="w-full h-auto object-cover aspect-[3/4]"
                                />
                                <div
                                    className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${
                                        theme === "dark"
                                            ? "to-black/50"
                                            : "to-white/50"
                                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}
                                >
                                    <span
                                        className={`${
                                            theme === "dark"
                                                ? "text-white"
                                                : "text-gray-900"
                                        } font-medium`}
                                    >
                                        Click to enlarge
                                    </span>
                                </div>
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/30 transition-all duration-300 rounded-xl pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Game Details */}
                        <div className="md:w-2/3 lg:w-3/4">
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                                    {game.name}
                                </h1>

                                {/* Release date and Metacritic */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    {game.released && (
                                        <div
                                            className={`flex items-center ${
                                                theme === "dark"
                                                    ? "bg-gray-800/80"
                                                    : "bg-gray-200/80"
                                            } px-3 py-1 rounded-full`}
                                        >
                                            <Calendar
                                                size={16}
                                                className="mr-2 text-cyan-400"
                                            />
                                            <span className="text-sm font-medium">
                                                {new Date(
                                                    game.released
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {game.metacritic && (
                                        <div
                                            className={`px-3 py-1 rounded-full font-bold text-sm flex items-center ${
                                                game.metacritic >= 75
                                                    ? "bg-green-600/90"
                                                    : game.metacritic >= 50
                                                    ? "bg-yellow-600/90"
                                                    : "bg-red-600/90"
                                            }`}
                                        >
                                            Metacritic: {game.metacritic}
                                        </div>
                                    )}
                                </div>

                                {/* Genres */}
                                {game.genres?.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-2 mb-6">
                                        <Tag
                                            size={18}
                                            className="text-cyan-400"
                                        />
                                        {game.genres.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className={`px-3 py-1 ${
                                                    theme === "dark"
                                                        ? "bg-gray-800/70"
                                                        : "bg-gray-200/70"
                                                } rounded-full text-sm font-medium hover:bg-cyan-500/20 transition-colors duration-200`}
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Platforms */}
                                {game.platforms?.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-3 mb-8">
                                        <Monitor
                                            size={18}
                                            className="text-cyan-400"
                                        />
                                        {game.platforms.map((platform) => (
                                            <span
                                                key={platform.id}
                                                className={`text-sm ${
                                                    theme === "dark"
                                                        ? "bg-gray-800/50"
                                                        : "bg-gray-200/50"
                                                } px-3 py-1 rounded-full border ${
                                                    theme === "dark"
                                                        ? "border-gray-700"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                {platform.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-4 mb-8">
                                {/* User Rating */}
                                <div
                                    className={`${
                                        theme === "dark"
                                            ? "bg-gray-800/70"
                                            : "bg-gray-200/70"
                                    } p-4 rounded-xl border ${
                                        theme === "dark"
                                            ? "border-gray-700/50"
                                            : "border-gray-300/50"
                                    } flex-1 min-w-[250px]`}
                                >
                                    <h3 className="text-lg font-semibold mb-3 text-cyan-400">
                                        Your Rating
                                    </h3>
                                    <RatingStars
                                        gameId={game.id}
                                        initialRating={userRating}
                                        onRatingChange={setUserRating}
                                        starClassName="text-2xl"
                                    />
                                </div>

                                {/* Add to List */}
                                {user && (
                                    <div
                                        className={`${
                                            theme === "dark"
                                                ? "bg-gray-800/70"
                                                : "bg-gray-200/70"
                                        } p-4 rounded-xl border ${
                                            theme === "dark"
                                                ? "border-gray-700/50"
                                                : "border-gray-300/50"
                                        } flex-1 min-w-[250px] relative`}
                                    >
                                        <h3 className="text-lg font-semibold mb-3 text-cyan-400">
                                            Collections
                                        </h3>

                                        {successMessage && (
                                            <div
                                                className={`mb-3 p-2 bg-green-600/20 border ${
                                                    theme === "dark"
                                                        ? "border-green-600/30"
                                                        : "border-green-600/20"
                                                } rounded-lg text-green-400 text-sm`}
                                            >
                                                {successMessage}
                                            </div>
                                        )}

                                        <button
                                            onClick={() =>
                                                setIsAddToListOpen(
                                                    !isAddToListOpen
                                                )
                                            }
                                            className="flex items-center justify-center w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all duration-300"
                                        >
                                            <Plus size={18} className="mr-2" />
                                            Add to List
                                            <ChevronDown
                                                size={18}
                                                className="ml-2"
                                            />
                                        </button>

                                        {isAddToListOpen && (
                                            <div
                                                className={`absolute z-10 mt-2 w-full rounded-xl shadow-2xl ${
                                                    theme === "dark"
                                                        ? "bg-gray-800"
                                                        : "bg-gray-200"
                                                } border ${
                                                    theme === "dark"
                                                        ? "border-gray-700"
                                                        : "border-gray-300"
                                                } overflow-hidden`}
                                            >
                                                <div className="py-1">
                                                    {userLists.length > 0 ? (
                                                        userLists.map(
                                                            (list) => (
                                                                <button
                                                                    key={
                                                                        list.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleAddToList(
                                                                            list.id
                                                                        )
                                                                    }
                                                                    className={`flex justify-between items-center w-full text-left px-4 py-3 hover:${
                                                                        theme ===
                                                                        "dark"
                                                                            ? "bg-gray-700/50"
                                                                            : "bg-gray-300/50"
                                                                    } transition-colors duration-200 border-b ${
                                                                        theme ===
                                                                        "dark"
                                                                            ? "border-gray-700/50"
                                                                            : "border-gray-300/50"
                                                                    } last:border-0`}
                                                                >
                                                                    <span>
                                                                        {
                                                                            list.name
                                                                        }
                                                                    </span>
                                                                </button>
                                                            )
                                                        )
                                                    ) : (
                                                        <p
                                                            className={`px-4 py-3 text-sm ${
                                                                theme === "dark"
                                                                    ? "text-gray-400"
                                                                    : "text-gray-600"
                                                            } border-b ${
                                                                theme === "dark"
                                                                    ? "border-gray-700/50"
                                                                    : "border-gray-300/50"
                                                            }`}
                                                        >
                                                            You don't have any
                                                            lists yet
                                                        </p>
                                                    )}
                                                    <Link
                                                        to={`/users/${user.name}`}
                                                        className={`block w-full text-left px-4 py-3 text-cyan-400 hover:${
                                                            theme === "dark"
                                                                ? "bg-gray-700/50"
                                                                : "bg-gray-300/50"
                                                        } transition-colors duration-200 font-medium`}
                                                    >
                                                        Manage Lists
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {game.description && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700 text-cyan-400">
                                        About
                                    </h3>
                                    <SmartDescription
                                        text={game.description}
                                        maxCollapsedChars={300}
                                    />
                                </div>
                            )}

                            {/* Website link */}
                            {game.website && (
                                <a
                                    href={game.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center px-4 py-2 ${
                                        theme === "dark"
                                            ? "bg-gray-800 hover:bg-gray-700"
                                            : "bg-gray-200 hover:bg-gray-300"
                                    } rounded-lg border ${
                                        theme === "dark"
                                            ? "border-gray-700"
                                            : "border-gray-300"
                                    } text-cyan-400 hover:text-cyan-300 transition-all duration-300`}
                                >
                                    Visit Official Website
                                    <ExternalLink size={16} className="ml-2" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-w-5xl w-full p-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className={`absolute top-6 right-6 p-2 ${
                                theme === "dark"
                                    ? "bg-gray-800 hover:bg-gray-700"
                                    : "bg-gray-200 hover:bg-gray-300"
                            } rounded-full border ${
                                theme === "dark"
                                    ? "border-gray-700"
                                    : "border-gray-300"
                            } transition-all duration-300 hover:rotate-90`}
                        >
                            <X
                                size={24}
                                className={
                                    theme === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                }
                            />
                        </button>
                        <img
                            src={game.image_url || "/placeholder.svg"}
                            alt={game.name}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl border-2 border-gray-700"
                        />
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <section className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-700 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                        Community Reviews
                    </h2>

                    {user && (
                        <div
                            className={`mb-10 ${
                                theme === "dark"
                                    ? "bg-gray-800/50"
                                    : "bg-gray-200/50"
                            } p-6 rounded-xl border ${
                                theme === "dark"
                                    ? "border-gray-700/50"
                                    : "border-gray-300/50"
                            } shadow-lg`}
                        >
                            <ReviewForm
                                gameId={game.id}
                                onReviewSubmit={fetchGameDetails}
                            />
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    showUser={true}
                                    showGame={false}
                                    showGameImage={false}
                                    className={`${
                                        theme === "dark"
                                            ? "bg-gray-800/50 hover:bg-gray-800/70"
                                            : "bg-gray-200/50 hover:bg-gray-200/70"
                                    } transition-colors duration-300 border ${
                                        theme === "dark"
                                            ? "border-gray-700/50"
                                            : "border-gray-300/50"
                                    } rounded-xl overflow-hidden shadow-lg`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`${
                                theme === "dark"
                                    ? "bg-gray-800/50"
                                    : "bg-gray-200/50"
                            } p-8 rounded-xl border ${
                                theme === "dark"
                                    ? "border-gray-700/50"
                                    : "border-gray-300/50"
                            } text-center`}
                        >
                            <h3 className="text-xl font-medium mb-2 text-cyan-400">
                                No reviews yet
                            </h3>
                            <p
                                className={
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                }
                            >
                                Be the first to share your thoughts about{" "}
                                {game.name}!
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
