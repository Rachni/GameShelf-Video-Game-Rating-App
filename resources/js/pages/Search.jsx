import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { GameCard } from "../components/GameCard";
import { useTheme } from "../contexts/ThemeContext";
import { SearchIcon, Filter, ChevronDown } from "lucide-react";

export function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme } = useTheme();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        genre: searchParams.get("genre") || "",
        platform: searchParams.get("platform") || "",
        year: searchParams.get("year") || "",
        sort: searchParams.get("sort") || "rating",
    });
    const [genres, setGenres] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [years, setYears] = useState([]);
    const debounceTimeout = useRef(null);

    // Generate years from 1980 to current year
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearsList = [];
        for (let year = currentYear; year >= 1980; year--) {
            yearsList.push(year);
        }
        setYears(yearsList);
    }, []);

    // Fetch genres and platforms
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [genresResponse, platformsResponse] = await Promise.all([
                    axios.get("/api/genres"),
                    axios.get("/api/platforms"),
                ]);
                setGenres(genresResponse.data);
                setPlatforms(platformsResponse.data);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        fetchFilters();
    }, []);

    // Debounce search functionality
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (searchQuery.length >= 2) {
            debounceTimeout.current = setTimeout(() => {
                handleSearch();
            }, 500);
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchQuery]);

    // Fetch games based on search params
    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);

            try {
                // Build query params
                const params = new URLSearchParams();
                if (searchQuery) params.append("query", searchQuery);
                if (filters.genre) params.append("genres", filters.genre);
                if (filters.platform)
                    params.append("platforms", filters.platform);
                if (filters.year) params.append("year", filters.year);
                if (filters.sort) params.append("ordering", filters.sort);
                params.append("page", page);

                const response = await axios.get(
                    `/api/games/search-games?${params.toString()}`
                );

                if (page === 1) {
                    setGames(response.data.results || []);
                } else {
                    setGames((prevGames) => [
                        ...prevGames,
                        ...(response.data.results || []),
                    ]);
                }

                setTotalResults(
                    response.data.pagination?.total ||
                        response.data.results?.length ||
                        0
                );
                setHasMore(response.data.has_more || false);
            } catch (error) {
                console.error("Error fetching games:", error);
                setGames([]);
                setTotalResults(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, [searchQuery, filters, page]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (filters.genre) params.set("genre", filters.genre);
        if (filters.platform) params.set("platform", filters.platform);
        if (filters.year) params.set("year", filters.year);
        if (filters.sort) params.set("sort", filters.sort);

        setSearchParams(params);
    }, [searchQuery, filters, setSearchParams]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setPage(1);
        setGames([]);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
        setPage(1);
        setGames([]);
    };

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Search Games</h1>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Search for games..."
                            className={`w-full py-3 pl-12 pr-4 rounded-lg ${
                                theme === "dark"
                                    ? "bg-gray-800 border-gray-700"
                                    : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                        <SearchIcon
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary text-white rounded-md"
                        >
                            Search
                        </button>
                    </div>
                </form>

                <div className="mb-6">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center px-4 py-2 rounded-lg ${
                            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                    >
                        <Filter size={18} className="mr-2" />
                        Filters
                        <ChevronDown
                            size={18}
                            className={`ml-2 transition-transform ${
                                isFilterOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {isFilterOpen && (
                        <div
                            className={`mt-4 p-4 rounded-lg ${
                                theme === "dark" ? "bg-gray-800" : "bg-white"
                            } shadow-md`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Genre
                                    </label>
                                    <select
                                        value={filters.genre}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "genre",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full p-2 rounded-md ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-white border-gray-300"
                                        } border`}
                                    >
                                        <option value="">All Genres</option>
                                        {genres.map((genre) => (
                                            <option
                                                key={genre.id}
                                                value={genre.id}
                                            >
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Platform
                                    </label>
                                    <select
                                        value={filters.platform}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "platform",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full p-2 rounded-md ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-white border-gray-300"
                                        } border`}
                                    >
                                        <option value="">All Platforms</option>
                                        {platforms.map((platform) => (
                                            <option
                                                key={platform.id}
                                                value={platform.id}
                                            >
                                                {platform.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Year
                                    </label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "year",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full p-2 rounded-md ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-white border-gray-300"
                                        } border`}
                                    >
                                        <option value="">All Years</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "sort",
                                                e.target.value
                                            )
                                        }
                                        className={`w-full p-2 rounded-md ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-white border-gray-300"
                                        } border`}
                                    >
                                        <option value="-rating">
                                            Rating (High to Low)
                                        </option>
                                        <option value="rating">
                                            Rating (Low to High)
                                        </option>
                                        <option value="-released">
                                            Release Date (Newest)
                                        </option>
                                        <option value="released">
                                            Release Date (Oldest)
                                        </option>
                                        <option value="-name">
                                            Name (Z-A)
                                        </option>
                                        <option value="name">Name (A-Z)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {totalResults > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Found {totalResults} results
                    </p>
                )}
            </div>

            {isLoading && games.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Loading...</p>
                </div>
            ) : games.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {games.map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className={`px-6 py-3 rounded-lg ${
                                    theme === "dark"
                                        ? "bg-gray-800"
                                        : "bg-white"
                                } shadow-md hover:shadow-lg transition-shadow`}
                            >
                                {isLoading ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div
                    className={`p-8 rounded-lg text-center ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                >
                    <p className="text-xl mb-4">No games found</p>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filters to find what you're
                        looking for.
                    </p>
                </div>
            )}
        </div>
    );
}
