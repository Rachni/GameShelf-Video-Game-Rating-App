"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Calendar, Trash2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
};

const renderStars = (rating) => {
    const maxStars = 5;
    return (
        <div className="flex gap-[2px]">
            {[...Array(maxStars)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                            starValue <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : starValue - 0.5 <= rating
                                ? "fill-yellow-400 text-yellow-400 opacity-50"
                                : "text-gray-400"
                        }`}
                    />
                );
            })}
        </div>
    );
};

export function GameListItem({ game, onRemove }) {
    const { theme } = useTheme();
    const [showConfirm, setShowConfirm] = useState(false);
    const { id, name, image_url, cover, slug, average_rating, release_date } =
        game;
    const rating = Number.parseFloat(average_rating) || 0;
    const url = `/games/${slug || id}`;
    const imageUrl = image_url || cover || "/placeholder.svg";

    const handleRemoveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleConfirmRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(id);
        setShowConfirm(false);
    };

    const handleCancelRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <div
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50 border border-gray-200"
            }`}
        >
            <Link
                to={url}
                className="flex-shrink-0 w-16 h-20 overflow-hidden rounded"
            >
                <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </Link>

            <div className="flex-grow min-w-0">
                <Link to={url} className="block">
                    <h3 className="font-medium text-lg mb-1 truncate">
                        {name}
                    </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    {release_date && (
                        <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span>{formatDate(release_date)}</span>
                        </div>
                    )}
                    {rating > 0 && (
                        <div className="flex items-center gap-1">
                            {renderStars(rating)}
                            <span>({rating.toFixed(1)})</span>
                        </div>
                    )}
                </div>
            </div>

            {onRemove && (
                <div className="flex-shrink-0 ml-2">
                    {showConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleConfirmRemove}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCancelRemove}
                                className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleRemoveClick}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                            title="Remove from list"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
