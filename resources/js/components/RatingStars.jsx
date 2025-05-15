import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export function RatingStars({
    gameId,
    initialRating = 0,
    onRatingChange,
    size = 24,
    disabled = false,
    showLabel = false,
}) {
    const [rating, setRating] = useState(initialRating);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, token, checkAuth } = useAuth();

    useEffect(() => {
        setRating(initialRating);
    }, [initialRating]);

    const handleRating = async (value) => {
        if (!user || disabled) {
            alert("Please log in to rate games");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Verificar autenticación
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                throw new Error("Session expired");
            }

            // 2. Obtener token CSRF si no existe
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            // 3. Hacer la petición de rating
            const response = await axios.post(
                "/api/games/rate",
                {
                    game_id: gameId,
                    rating: value,
                    text: "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    withCredentials: true,
                }
            );

            setRating(value);
            if (onRatingChange) {
                onRatingChange(value, response.data);
            }
        } catch (error) {
            console.error("Rating error:", {
                message: error.message,
                response: error.response,
                config: error.config,
            });

            setRating(initialRating);
            setError(error.response?.data?.message || error.message);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            } else if (error.response?.status === 422) {
                alert(
                    "Validation error: " +
                        Object.values(error.response.data.errors).join("\n")
                );
            } else {
                alert("Failed to save rating. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const ratingText = () => {
        switch (rating) {
            case 1:
                return "Poor";
            case 2:
                return "Fair";
            case 3:
                return "Good";
            case 4:
                return "Very Good";
            case 5:
                return "Excellent";
            default:
                return "Rate this game";
        }
    };

    return (
        <div className={`flex flex-col ${disabled ? "opacity-50" : ""}`}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled || isLoading}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => !disabled && setHoveredRating(star)}
                        onMouseLeave={() => !disabled && setHoveredRating(0)}
                        className={`focus:outline-none ${
                            disabled ? "cursor-default" : "cursor-pointer"
                        }`}
                        aria-label={`Rate ${star} out of 5`}
                    >
                        <Star
                            size={size}
                            className={`transition-colors duration-150 ${
                                (
                                    hoveredRating
                                        ? hoveredRating >= star
                                        : rating >= star
                                )
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                            } ${isLoading ? "animate-pulse" : ""}`}
                        />
                    </button>
                ))}
            </div>

            {showLabel && (
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {rating > 0 ? ratingText() : "Not rated yet"}
                </div>
            )}

            {isLoading && (
                <div className="mt-1 text-xs text-gray-500">Saving...</div>
            )}
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
        </div>
    );
}
