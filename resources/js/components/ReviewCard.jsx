import { useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

export function ReviewCard({
    review,
    showUser = true,
    showGame = true,
    showGameImage = false,
}) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [likes, setLikes] = useState(review.likes || 0);
    const [isLiked, setIsLiked] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return null;

        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? null
                : date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  });
        } catch {
            return null;
        }
    };

    const formattedDate = formatDate(review.created_at);

    const handleLike = async () => {
        if (!user) {
            alert("Please log in to like reviews");
            return;
        }

        try {
            const response = await axios.post(
                `/api/reviews/${review.id}/toggle-like`
            );
            setLikes(response.data.likes);
            setIsLiked(response.data.is_liked);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div
            className={`rounded-2xl p-6 mb-6 transition-all duration-300
            ${
                theme === "dark"
                    ? "bg-darkBg border-gray-700"
                    : "bg-lightBg border-gray-200"
            }
            shadow-lg hover:shadow-xl border`}
        >
            <div className="flex items-start gap-4">
                {/* Game Image */}
                {showGame && showGameImage && (
                    <Link
                        to={`/games/${review.game.slug}`}
                        className="flex-shrink-0 transition-transform hover:scale-105"
                    >
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-interactive/20">
                            <img
                                src={
                                    review.game.image_url ||
                                    "/placeholder.svg?height=150&width=150"
                                }
                                alt={review.game.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                )}

                <div className="flex-1 min-w-0">
                    {/* Game Name */}
                    {showGame && (
                        <Link
                            to={`/games/${review.game.slug}`}
                            className="font-semibold text-lg text-textLight dark:text-textDark hover:text-interactive transition-colors"
                        >
                            {review.game.name}
                        </Link>
                    )}

                    {/* Review Content */}
                    <p className="my-3 text-textLight/80 dark:text-textDark/80">
                        {review.text}
                    </p>

                    {/* Star Rating */}
                    <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                className={`${
                                    star <= review.star_rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300 dark:text-gray-600"
                                } mr-1`}
                            />
                        ))}
                        <span className="ml-2 text-sm font-medium text-textLight/60 dark:text-textDark/60">
                            {review.star_rating.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* User Info */}
                {showUser && (
                    <div className="flex flex-col items-end ml-4">
                        <Link
                            to={`/users/${review.user.name}`}
                            className="flex items-center gap-2 group"
                        >
                            <div className="text-right">
                                <span className="font-medium text-textLight dark:text-textDark group-hover:text-interactive transition-colors">
                                    {review.user.name}
                                </span>
                                {formattedDate && (
                                    <div className="text-xs text-textLight/60 dark:text-textDark/60">
                                        {formattedDate}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <img
                                    src={
                                        review.user.avatar ||
                                        "/placeholder.svg?height=40&width=40"
                                    }
                                    alt={review.user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-interactive transition-all"
                                />
                                <div className="absolute inset-0 rounded-full bg-interactive/0 group-hover:bg-interactive/10 transition-all -z-10"></div>
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            {/* Like Button */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all
                        ${
                            isLiked
                                ? "bg-interactive/10 text-interactive ring-1 ring-interactive/30"
                                : "text-textLight/60 dark:text-textDark/60 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                        hover:scale-105 active:scale-95
                    `}
                >
                    <ThumbsUp
                        size={18}
                        className={isLiked ? "fill-interactive" : ""}
                    />
                    <span className="font-medium">{likes}</span>
                </button>
            </div>
        </div>
    );
}
