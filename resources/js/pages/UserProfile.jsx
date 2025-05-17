"use client";
import { GameCardSimple } from "../components/GameCardSimple";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { GameCard } from "../components/GameCard";
import { ReviewCard } from "../components/ReviewCard";
import { Settings, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { GenreChart } from "../components/GenreChart";

const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
});

export function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token } = useAuth();
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [favoriteGames, setFavoriteGames] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const [genreStats, setGenreStats] = useState([]);
    const [listGenreStats, setListGenreStats] = useState([]);
    const [activeTab, setActiveTab] = useState("reviews");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [editingListId, setEditingListId] = useState(null);
    const [editingListName, setEditingListName] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const isOwnProfile = currentUser && user && currentUser.id === user.id;

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const userResponse = await api.get(`/users/${username}`);
                if (
                    !userResponse.data ||
                    userResponse.data.message === "User not found"
                ) {
                    throw new Error("User not found.");
                }

                const userData = {
                    id: userResponse.data.id,
                    name: userResponse.data.name,
                    profile_pic: userResponse.data.profile_pic,
                    bio: userResponse.data.bio,
                };

                setUser(userData);

                const [favorites, reviews, lists, stats, listGenreStats] =
                    await Promise.all([
                        api
                            .get(`/users/${username}/favorites`)
                            .catch(() => ({ data: [] })),
                        api
                            .get(`/users/${username}/reviews`)
                            .catch(() => ({ data: [] })),
                        api
                            .get(`/users/${username}/lists`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                },
                                withCredentials: true,
                            })
                            .catch(() => ({ data: [] })),
                        api
                            .get(`/users/${username}/stats/genres`)
                            .catch(() => ({ data: [] })),
                        api
                            .get(`/users/${username}/stats/list-genres`)
                            .catch(() => ({ data: [] })),
                    ]);

                setFavoriteGames(favorites.data);

                const formattedReviews = reviews.data.map((review) => ({
                    ...review,
                    game: {
                        id: review.game?.id || null,
                        name: review.game?.name || "Unknown Game",
                        image_url: review.game?.image_url || "",
                    },
                    text: review.text || "",
                    star_rating: review.star_rating || 0,
                    likes: review.likes || 0,
                }));
                setRecentReviews(formattedReviews);

                setUserLists(lists.data);
                setGenreStats(stats.data);
                setListGenreStats(listGenreStats.data);
            } catch (error) {
                console.error("Failed to load user profile:", error);
                setError(
                    error.response?.data?.message ||
                        error.message ||
                        "Failed to load user profile."
                );
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [username, currentUser, navigate, token]);

    const createList = async () => {
        if (!newListName.trim()) {
            setError("List name cannot be empty");
            return;
        }

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await api.post(
                "/lists",
                { name: newListName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            setUserLists([...userLists, response.data]);
            setNewListName("");
            setIsCreatingList(false);
            setSuccessMessage("List created successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error creating list:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to create list."
            );
            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            }
        }
    };

    const updateList = async (listId) => {
        if (!editingListName.trim()) {
            setError("List name cannot be empty");
            return;
        }

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            await api.put(
                `/lists/${listId}`,
                { name: editingListName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            const updatedLists = userLists.map((list) =>
                list.id === listId ? { ...list, name: editingListName } : list
            );

            setUserLists(updatedLists);
            setEditingListId(null);
            setEditingListName("");
            setSuccessMessage("List updated successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error updating list:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to update list."
            );
            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            }
        }
    };

    const deleteList = async (listId) => {
        if (!confirm("Are you sure you want to delete this list?")) return;

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            await api.delete(`/lists/${listId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                withCredentials: true,
            });

            setUserLists(userLists.filter((list) => list.id !== listId));
            setSuccessMessage("List deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error deleting list:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to delete list."
            );
            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-4">
                            <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="flex gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-heading dark:text-textDark mb-4">
                    Error
                </h2>
                <p className="mb-6 text-red-500 dark:text-red-400">{error}</p>
                {!currentUser && (
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-interactive text-white rounded hover:bg-interactiveHover transition-colors"
                    >
                        Log In
                    </Link>
                )}
                <Link
                    to="/"
                    className="inline-block mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-heading dark:text-textDark mb-4">
                    User not found
                </h2>
                <p className="mb-6 text-textLight dark:text-textDark">
                    User @{username} doesn't exist or is private.
                </p>
                <Link
                    to="/"
                    className="px-4 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Profile Header */}
            <div className="rounded-lg p-6 mb-8 bg-white dark:bg-header shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative w-24 h-24 shrink-0">
                        <img
                            src={user.profile_pic || "/default-avatar.png"}
                            alt={`${user.name}'s avatar`}
                            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                            onError={(e) => {
                                e.target.src = "/default-avatar.png";
                            }}
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-heading dark:text-textDark mb-2">
                            {user.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                            @{username}
                        </p>
                        {user.bio && (
                            <p className="mb-4 text-textLight dark:text-textDark">
                                {user.bio}
                            </p>
                        )}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                            <div>
                                <span className="font-bold text-heading dark:text-textDark">
                                    {favoriteGames.length}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    Favorite Games
                                </span>
                            </div>
                            <div>
                                <span className="font-bold text-heading dark:text-textDark">
                                    {recentReviews.length}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    Reviews
                                </span>
                            </div>
                            <div>
                                <span className="font-bold text-heading dark:text-textDark">
                                    {userLists.length}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    Lists
                                </span>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <Link
                                to="/settings"
                                className="inline-flex items-center px-4 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm"
                            >
                                <Settings size={16} className="mr-2" />
                                Edit Profile
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Favorite Games */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-heading dark:text-textDark mb-4">
                    Favorite Games
                </h2>
                {favoriteGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {favoriteGames.slice(0, 5).map((game) => (
                            <GameCardSimple key={game.id} game={game} />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                        <p className="text-textLight dark:text-textDark">
                            {isOwnProfile
                                ? "You haven't added any favorites yet."
                                : "This user doesn't have favorites yet."}
                        </p>
                        {isOwnProfile && (
                            <div className="text-center mt-4">
                                <Link
                                    to="/games"
                                    className="px-4 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm inline-block"
                                >
                                    Explore Games
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Genre Statistics */}
            {genreStats.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-heading dark:text-textDark mb-4">
                        Genre Preferences
                    </h2>
                    <div className="p-4 rounded-lg bg-white dark:bg-header shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={genreStats}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill:
                                                theme === "dark"
                                                    ? "#e2e8f0"
                                                    : "#334155",
                                        }}
                                    />
                                    <YAxis
                                        tick={{
                                            fill:
                                                theme === "dark"
                                                    ? "#e2e8f0"
                                                    : "#334155",
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                theme === "dark"
                                                    ? "#1f2833"
                                                    : "#f8fafc",
                                            borderColor:
                                                theme === "dark"
                                                    ? "#2c3e50"
                                                    : "#cbd5e1",
                                            color:
                                                theme === "dark"
                                                    ? "#e2e8f0"
                                                    : "#334155",
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#ff0059"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            )}

            {/* List Genre Statistics */}
            {listGenreStats.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-heading dark:text-textDark mb-4">
                        Genres in Lists
                    </h2>
                    <GenreChart data={listGenreStats} />
                </section>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "reviews"
                                ? "border-heading text-heading dark:text-textDark"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab("lists")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "lists"
                                ? "border-heading text-heading dark:text-textDark"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        Lists
                    </button>
                </nav>
            </div>

            {/* Reviews Content */}
            {activeTab === "reviews" && (
                <section>
                    <h2 className="text-xl font-bold text-heading dark:text-textDark mb-4">
                        Recent Reviews
                    </h2>
                    {recentReviews.length > 0 ? (
                        <div className="space-y-3">
                            {recentReviews.slice(0, 5).map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    showUser={false}
                                    showGame={true}
                                    showGameImage={true}
                                    className="bg-white dark:bg-header border border-gray-200 dark:border-gray-700"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                            <p className="text-textLight dark:text-textDark">
                                {isOwnProfile
                                    ? "You haven't written any reviews yet."
                                    : "This user hasn't written reviews yet."}
                            </p>
                            {isOwnProfile && (
                                <div className="text-center mt-4">
                                    <Link
                                        to="/games"
                                        className="px-4 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm inline-block"
                                    >
                                        Write a Review
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Lists Content */}
            {activeTab === "lists" && (
                <section>
                    {successMessage && (
                        <div className="p-3 mb-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            {error}
                            <button
                                className="float-right font-bold"
                                onClick={() => setError(null)}
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-heading dark:text-textDark">
                            Game Lists
                        </h2>
                        {isOwnProfile && !isCreatingList && (
                            <button
                                onClick={() => setIsCreatingList(true)}
                                className="inline-flex items-center px-3 py-1.5 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm"
                            >
                                <Plus size={16} className="mr-1" />
                                Create List
                            </button>
                        )}
                    </div>

                    {isCreatingList && isOwnProfile && (
                        <div className="p-4 mb-6 rounded-lg bg-white dark:bg-header shadow-md border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-heading dark:text-textDark mb-3">
                                Create New List
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) =>
                                        setNewListName(e.target.value)
                                    }
                                    placeholder="Enter list name"
                                    className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-textLight dark:text-textDark focus:outline-none focus:ring-2 focus:ring-heading"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={createList}
                                        className="px-3 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreatingList(false);
                                            setNewListName("");
                                        }}
                                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {userLists.length > 0 ? (
                        <div className="space-y-3">
                            {userLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="p-4 rounded-lg bg-white dark:bg-header shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                    {editingListId === list.id ? (
                                        <div className="flex items-center mb-3">
                                            <input
                                                type="text"
                                                value={editingListName}
                                                onChange={(e) =>
                                                    setEditingListName(
                                                        e.target.value
                                                    )
                                                }
                                                className="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-textLight dark:text-textDark focus:outline-none focus:ring-2 focus:ring-heading mr-2"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() =>
                                                    updateList(list.id)
                                                }
                                                className="text-green-600 hover:text-green-800 mr-1 p-1"
                                                title="Save"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingListId(null);
                                                    setEditingListName("");
                                                }}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Cancel"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-lg font-semibold text-heading dark:text-textDark flex items-center">
                                                {list.name}
                                                {list.is_favorite === 1 && (
                                                    <span className="ml-2 text-yellow-500 text-xs">
                                                        (Favorites)
                                                    </span>
                                                )}
                                            </h3>
                                            {isOwnProfile &&
                                                !list.is_favorite && (
                                                    <div className="flex">
                                                        <button
                                                            onClick={() => {
                                                                setEditingListId(
                                                                    list.id
                                                                );
                                                                setEditingListName(
                                                                    list.name
                                                                );
                                                            }}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mr-1 p-1"
                                                            title="Edit list"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteList(
                                                                    list.id
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete list"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {list.games && list.games.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {list.games
                                                .slice(0, 4)
                                                .map((game) => (
                                                    <GameCardSimple
                                                        key={game.id}
                                                        game={game}
                                                    />
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-3">
                                            This list is empty
                                        </p>
                                    )}

                                    <div className="mt-3 text-right">
                                        <Link
                                            to={`/users/${username}/lists/${list.id}/`}
                                            className="text-heading hover:text-[#E00050] transition-colors text-sm font-medium"
                                        >
                                            View Full List →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                            <p className="text-textLight dark:text-textDark">
                                {isOwnProfile
                                    ? "You haven't created any lists yet."
                                    : "This user doesn't have public lists."}
                            </p>
                            {isOwnProfile && !isCreatingList && (
                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => setIsCreatingList(true)}
                                        className="px-4 py-2 bg-heading text-white rounded hover:bg-[#E00050] transition-colors text-sm inline-block"
                                    >
                                        Create Your First List
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
