import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GameCardSimple } from "../components/GameCardSimple";
import { useLoading } from "../contexts/LoadingContext";
import { Search, ChevronDown } from "lucide-react";

export function Games() {
    const { setLoading, isLoading } = useLoading();
    const [games, setGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [genres, setGenres] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [showUnderConstruction, setShowUnderConstruction] = useState(true);

    // Estados para controlar los filtros desplegables
    const [genresOpen, setGenresOpen] = useState(true);
    const [platformsOpen, setPlatformsOpen] = useState(true);
    const [storesOpen, setStoresOpen] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse query parameters from URL
        const params = new URLSearchParams(location.search);
        const query = params.get("search") || "";
        const genreIds = params.get("genres")?.split(",").filter(Boolean) || [];
        const platformIds =
            params.get("platforms")?.split(",").filter(Boolean) || [];
        const storeIds = params.get("stores")?.split(",").filter(Boolean) || [];
        const page = Number.parseInt(params.get("page")) || 1;

        setSearchQuery(query);
        setSelectedGenres(genreIds);
        setSelectedPlatforms(platformIds);
        setSelectedStores(storeIds);

        // Load filters and games
        loadFilters();
        searchGames(query, genreIds, platformIds, storeIds, page);
    }, [location.search]);

    const loadFilters = async () => {
        try {
            const [genresResponse, platformsResponse, storesResponse] =
                await Promise.all([
                    axios.get("/api/genres"),
                    axios.get("/api/platforms"),
                    axios.get("/api/stores"),
                ]);

            setGenres(genresResponse.data);
            setPlatforms(platformsResponse.data);
            setStores(storesResponse.data);
        } catch (error) {
            console.error("Error loading filters:", error);
        }
    };

    const searchGames = async (
        query,
        genreIds = [],
        platformIds = [],
        storeIds = [],
        page = 1
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (query) params.append("search", query);
            if (genreIds.length > 0)
                params.append("genres", genreIds.join(","));
            if (platformIds.length > 0)
                params.append("platforms", platformIds.join(","));
            if (storeIds.length > 0)
                params.append("stores", storeIds.join(","));
            params.append("page", page);

            const response = await axios.get(
                `/api/games/filter?${params.toString()}`
            );

            setGames(response.data.games);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.lastPage,
                totalItems: response.data.total,
            });
        } catch (error) {
            console.error("Error searching games:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        updateSearchParams();
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            updateSearchParams();
        }
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    const togglePlatform = (platformId) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platformId)
                ? prev.filter((id) => id !== platformId)
                : [...prev, platformId]
        );
    };

    const toggleStore = (storeId) => {
        setSelectedStores((prev) =>
            prev.includes(storeId)
                ? prev.filter((id) => id !== storeId)
                : [...prev, storeId]
        );
    };

    const updateSearchParams = () => {
        const params = new URLSearchParams();

        if (searchQuery) params.append("search", searchQuery);
        if (selectedGenres.length > 0)
            params.append("genres", selectedGenres.join(","));
        if (selectedPlatforms.length > 0)
            params.append("platforms", selectedPlatforms.join(","));
        if (selectedStores.length > 0)
            params.append("stores", selectedStores.join(","));
        params.append("page", "1"); // Reset to first page on new search

        navigate(`/games?${params.toString()}`);
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(location.search);
        params.set("page", newPage);
        navigate(`/games?${params.toString()}`);
    };

    const applyFilters = () => {
        updateSearchParams();
    };

    // Toggle para dispositivos móviles
    const toggleMobileFilters = () => {
        setFiltersOpen(!filtersOpen);
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 relative">
            {/* Overlay de "Under Construction" - Versión con texto e imagen */}
            {showUnderConstruction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
                    <div className="relative bg-white dark:bg-gray-800 p-8 rounded-lg max-w-2xl w-full text-center shadow-2xl">
                
                        {/* <div className="mb-6 flex justify-center">
                            <img
                                src="/images/under-construction.png"
                                alt="Under Construction"
                                className="h-32 w-auto object-contain"
                            />
                        </div> */}

                        <h2 className="text-5xl font-bold mb-6 text-red-500 dark:text-red-400 animate-pulse">
                            UNDER CONSTRUCTION :)
                        </h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                            I'm working hard to improve your experience. Please
                            check back soon!
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                            <p>This section is temporarily unavailable</p>
                        </div>

                        <button
                            onClick={() => setShowUnderConstruction(false)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
                        >
                            I understand, show me anyway
                        </button>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Games
            </h1>

            {/* Botón para mostrar/ocultar filtros en móvil */}
            <div className="md:hidden mb-4">
                <button
                    onClick={toggleMobileFilters}
                    className="w-full flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-800 rounded-lg"
                >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                        Filters
                    </span>
                    <ChevronDown
                        className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
                            filtersOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filtros - ocultos en móvil por defecto */}
                <div
                    className={`w-full md:w-1/4 ${
                        filtersOpen ? "block" : "hidden"
                    } md:block`}
                >
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Filters
                        </h2>

                        {/* Search bar */}
                        <div className="mb-6">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSearch();
                                }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    placeholder="Search games..."
                                    className="w-full p-2 pl-10 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="submit"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </form>
                        </div>

                        {/* Genre filters - desplegable */}
                        <div className="mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setGenresOpen(!genresOpen)}
                            >
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                    Genres
                                </h3>
                                <ChevronDown
                                    className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
                                        genresOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </div>
                            {genresOpen && (
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {genres.map((genre) => (
                                        <div
                                            key={genre.id}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`genre-${genre.id}`}
                                                checked={selectedGenres.includes(
                                                    genre.id.toString()
                                                )}
                                                onChange={() =>
                                                    toggleGenre(
                                                        genre.id.toString()
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            <label
                                                htmlFor={`genre-${genre.id}`}
                                                className="text-gray-700 dark:text-gray-300"
                                            >
                                                {genre.name} (
                                                {genre.games_count || 0})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Platform filters - desplegable */}
                        <div className="mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setPlatformsOpen(!platformsOpen)}
                            >
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                    Platforms
                                </h3>
                                <ChevronDown
                                    className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
                                        platformsOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </div>
                            {platformsOpen && (
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {platforms.map((platform) => (
                                        <div
                                            key={platform.id}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`platform-${platform.id}`}
                                                checked={selectedPlatforms.includes(
                                                    platform.id.toString()
                                                )}
                                                onChange={() =>
                                                    togglePlatform(
                                                        platform.id.toString()
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            <label
                                                htmlFor={`platform-${platform.id}`}
                                                className="text-gray-700 dark:text-gray-300"
                                            >
                                                {platform.name} (
                                                {platform.games_count || 0})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Store filters - desplegable */}
                        <div className="mb-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setStoresOpen(!storesOpen)}
                            >
                                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                    Stores
                                </h3>
                                <ChevronDown
                                    className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
                                        storesOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </div>
                            {storesOpen && (
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {stores.map((store) => (
                                        <div
                                            key={store.id}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`store-${store.id}`}
                                                checked={selectedStores.includes(
                                                    store.id.toString()
                                                )}
                                                onChange={() =>
                                                    toggleStore(
                                                        store.id.toString()
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            <label
                                                htmlFor={`store-${store.id}`}
                                                className="text-gray-700 dark:text-gray-300"
                                            >
                                                {store.name} (
                                                {store.games_count || 0})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Games grid */}
                <div className="w-full md:w-3/4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : games.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {games.map((game) => (
                                    <GameCardSimple key={game.id} game={game} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex gap-2">
                                        {Array.from(
                                            { length: pagination.totalPages },
                                            (_, i) => i + 1
                                        ).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`px-4 py-2 rounded-md ${
                                                    pagination.currentPage ===
                                                    page
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-200 dark:bg-gray-800 rounded-lg shadow p-6">
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                No games found matching your criteria.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Try adjusting your filters or search query.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
