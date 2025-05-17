"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLoading } from "../contexts/LoadingContext";
import { GameCardSimple } from "../components/GameCardSimple";
import { ArrowLeft, Edit2, Trash2, Plus } from "lucide-react";

export function GameListDetail() {
    const { username, listId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const { setLoading } = useLoading();
    const [list, setList] = useState(null);
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [listName, setListName] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchListDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `/api/users/${username}/lists/${listId}`,
                    {
                        headers: {
                            Authorization:
                                user && token ? `Bearer ${token}` : "",
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        withCredentials: true,
                    }
                );

                setList(response.data.list);
                setListName(response.data.list.name);
                setGames(response.data.list.games || []);
            } catch (error) {
                console.error("Error fetching list details:", error);
                setError(
                    error.response?.data?.message ||
                        error.message ||
                        "Failed to load list details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (username && listId) {
            fetchListDetails();
        }
    }, [username, listId, user, token, setLoading]);

    const updateListName = async () => {
        if (!listName.trim()) {
            setError("List name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.put(
                `/api/lists/${list.id}`,
                { name: listName },
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

            setList({ ...list, name: listName });
            setIsEditing(false);
            setSuccessMessage("List name updated successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error updating list name:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to update list name."
            );

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteList = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this list? This action cannot be undone."
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            await axios.delete(`/api/lists/${list.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                withCredentials: true,
            });

            navigate(`/users/${username}`);
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
        } finally {
            setLoading(false);
        }
    };

    const removeGameFromList = async (gameId) => {
        setLoading(true);
        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            await axios.delete(`/api/lists/${list.id}/games/${gameId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                withCredentials: true,
            });

            setGames(games.filter((game) => game.id !== gameId));
            setSuccessMessage("Game removed from list successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error removing game from list:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to remove game from list."
            );

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="mb-6 text-red-500 dark:text-red-400">{error}</p>
                <Link
                    to={`/users/${username}`}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Profile
                </Link>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-200 dark:bg-gray-700 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const isOwnList = user && list.user_id === user.id;

    return (
        <div
            className={`container mx-auto px-4 py-8 ${
                theme === "dark" ? "dark" : ""
            }`}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-2">
                    <Link
                        to={`/users/${username}`}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    {isEditing ? (
                        <div className="flex items-center flex-1">
                            <input
                                type="text"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                className={`flex-1 px-4 py-2 text-2xl font-bold rounded-lg mr-2 ${
                                    theme === "dark"
                                        ? "bg-gray-700 text-white"
                                        : "bg-gray-100"
                                } border ${
                                    theme === "dark"
                                        ? "border-gray-600"
                                        : "border-gray-300"
                                }`}
                                autoFocus
                            />
                            <button
                                onClick={updateListName}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors mr-2"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setListName(list.name);
                                }}
                                className={`px-4 py-2 rounded ${
                                    theme === "dark"
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-200 hover:bg-gray-300"
                                } transition-colors`}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <h1 className="text-3xl font-bold dark:text-white flex-1">
                            {list.name}
                            {list.is_favorite === 1 && (
                                <span className="ml-2 text-yellow-500 text-sm">
                                    (Favorites)
                                </span>
                            )}
                        </h1>
                    )}

                    {isOwnList && !list.is_favorite && !isEditing && (
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 mr-2"
                                title="Edit list name"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button
                                onClick={deleteList}
                                className="text-red-600 hover:text-red-800 p-2"
                                title="Delete list"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                    {games.length} {games.length === 1 ? "game" : "games"} in
                    this list
                </p>
            </div>

            {successMessage && (
                <div
                    className={`p-4 mb-6 rounded-lg ${
                        theme === "dark" ? "bg-green-800/50" : "bg-green-100"
                    } text-green-700 dark:text-green-300`}
                >
                    {successMessage}
                </div>
            )}

            {/* Games Grid */}
            <section className="mb-16">
                {games.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {games.map((game) => (
                            <div key={game.id} className="relative group">
                                <GameCardSimple
                                    game={{
                                        ...game,
                                        genres: game.genres || [],
                                        platforms: game.platforms || [],
                                        stores: game.stores || [],
                                    }}
                                    onRemove={
                                        isOwnList && !list.is_favorite
                                            ? () => removeGameFromList(game.id)
                                            : null
                                    }
                                    className="transition-transform hover:scale-105 hover:shadow-xl"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className={`p-8 rounded-xl ${
                            theme === "dark"
                                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                                : "bg-gradient-to-br from-gray-50 to-gray-100"
                        } text-center`}
                    >
                        <p className="text-gray-500 dark:text-gray-400">
                            This list is empty.
                        </p>
                        {isOwnList && (
                            <Link
                                to="/games"
                                className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <Plus size={16} className="inline mr-1" />
                                Add Games
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            {games.length > 0 && isOwnList && (
                <section
                    className={`rounded-2xl p-8 text-center text-white ${
                        theme === "dark"
                            ? "bg-gradient-to-r from-purple-800 to-blue-900"
                            : "bg-gradient-to-r from-purple-500 to-blue-600"
                    }`}
                >
                    <h3 className="text-2xl font-bold mb-4">
                        Want to expand your collection?
                    </h3>
                    <p className="mb-6 max-w-2xl mx-auto opacity-90">
                        Discover more games and add them to your list!
                    </p>
                    <Link
                        to="/games"
                        className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Browse Games
                    </Link>
                </section>
            )}
        </div>
    );
}
