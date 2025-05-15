"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Loader from "../components/Spinner";

export const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const inputRef = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        // Focus the input when the component mounts
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Add event listener to close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                !event.target.closest(".search-bar-input")
            ) {
                setShowDropdown(false);
                if (onClose) onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [onClose]);

    const formatSearchQuery = (query) => {
        let formatted = query.trim().replace(/\s+/g, " ");
        return encodeURIComponent(formatted);
    };

    const searchGames = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setShowDropdown(false);
            setLoading(false);
            return;
        }

        try {
            const formattedQuery = formatSearchQuery(searchQuery);
            const response = await fetch(
                `/api/search-games?query=${formattedQuery}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Sort results by relevance
            const sortedGames = data.games?.sort((a, b) => {
                // Prioritize exact matches in title
                const exactMatchA =
                    a.name.toLowerCase() === searchQuery.toLowerCase();
                const exactMatchB =
                    b.name.toLowerCase() === searchQuery.toLowerCase();
                if (exactMatchA !== exactMatchB) {
                    return exactMatchA ? -1 : 1;
                }

                // Second criteria: Metacritic score
                return (b.metacritic_score || 0) - (a.metacritic_score || 0);
            });

            if (sortedGames?.length > 0) {
                setResults(sortedGames);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(true);
            }
        } catch (error) {
            console.error("Error searching games:", error);
            setResults([]);
            setShowDropdown(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Show spinner immediately if enough text
        if (value.trim().length >= 2) {
            setLoading(true);
            setShowDropdown(true);
        } else {
            setLoading(false);
            setShowDropdown(false);
        }

        // Clear previous timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Only search if query is at least 2 characters
        if (value.trim().length >= 2) {
            debounceTimeout.current = setTimeout(() => {
                searchGames(value);
            }, 300);
        } else {
            setResults([]);
            setShowDropdown(false);
            setLoading(false);
        }
    };

    const handleSelectGame = (game) => {
        navigate(`/games/${game.slug || game.id}`);
        setQuery("");
        setResults([]);
        setShowDropdown(false);
        if (onClose) onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery("");
            setResults([]);
            setShowDropdown(false);
            if (onClose) onClose();
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-4" ref={searchRef}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        className={`w-full p-4 pl-12 pr-12 rounded-full search-bar-input ${
                            theme === "dark"
                                ? "bg-gray-800 text-white placeholder-gray-400 border-gray-700 focus:ring-pink-500/30"
                                : "bg-gray-50 text-gray-800 placeholder-gray-500 border-gray-200 focus:ring-pink-400/30"
                        } border-0 focus:outline-none focus:ring-4 focus:shadow-lg transition-all duration-300 shadow-sm hover:shadow-md`}
                        placeholder="Search for games..."
                        value={query}
                        onChange={handleInputChange}
                        aria-label="Search games"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                                theme === "dark"
                                    ? "text-pink-400"
                                    : "text-pink-500"
                            } transition-colors duration-300`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    {query && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-5 group"
                            onClick={() => {
                                setQuery("");
                                setResults([]);
                                setShowDropdown(false);
                                setLoading(false);
                            }}
                            aria-label="Clear search"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${
                                    theme === "dark"
                                        ? "text-gray-400 group-hover:text-pink-400"
                                        : "text-gray-500 group-hover:text-pink-500"
                                } transition-colors duration-200`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </form>

            {/* Search Results Dropdown */}
            {showDropdown &&
                (loading || results.length > 0 || query.trim() !== "") && (
                    <div
                        className={`absolute z-[9999] w-full rounded-2xl shadow-xl ${
                            theme === "dark"
                                ? "bg-gray-800 border border-gray-700"
                                : "bg-white border border-gray-200"
                        } overflow-hidden max-h-[32rem] overflow-y-auto mt-2 backdrop-blur-sm bg-opacity-95`}
                        style={{
                            width: `${inputRef.current?.offsetWidth}px`,
                        }}
                    >
                        {loading ? (
                            <div
                                className={`flex justify-center items-center p-8 ${
                                    theme === "dark"
                                        ? "bg-gray-800/90"
                                        : "bg-white/90"
                                }`}
                            >
                                <Loader />
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {results.map((game) => (
                                    <li
                                        key={game.id || game.slug}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <button
                                            className="w-full text-left px-6 py-4 flex items-center gap-4 group"
                                            onClick={() =>
                                                handleSelectGame(game)
                                            }
                                        >
                                            <div className="flex-shrink-0">
                                                {game.image_url ? (
                                                    <img
                                                        src={
                                                            game.image_url ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={game.name}
                                                        className="w-14 h-18 object-cover rounded-lg group-hover:scale-105 transition-transform"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                "/placeholder-game.png";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-14 h-18 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                            No image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                                                    {game.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    {game.metacritic_score && (
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${
                                                                game.metacritic_score >=
                                                                75
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                                    : game.metacritic_score >=
                                                                      50
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                            }`}
                                                        >
                                                            Metacritic:{" "}
                                                            {
                                                                game.metacritic_score
                                                            }
                                                        </span>
                                                    )}
                                                    {game.release_date && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(
                                                                game.release_date
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : query.trim() !== "" ? (
                            <div
                                className={`p-6 text-center ${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                }`}
                            >
                                <p className="text-lg font-medium">
                                    No results found for
                                </p>
                                <p className="text-pink-500 dark:text-pink-400 font-semibold">
                                    "{query}"
                                </p>
                                <p className="mt-2 text-sm opacity-80">
                                    Try different keywords
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}
        </div>
    );
};
