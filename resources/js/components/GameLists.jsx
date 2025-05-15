"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { LoadingContext } from "../contexts/LoadingContext";
import { Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import Spinner from "./Spinner";

export default function GameLists({ gameId = null }) {
    const { user, token } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);
    const [lists, setLists] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [editingListId, setEditingListId] = useState(null);
    const [editingListName, setEditingListName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (user && token) {
            fetchUserLists();
        }
    }, [user, token]);

    const fetchUserLists = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/lists", {
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch lists");
            }

            const data = await response.json();
            setLists(data);
        } catch (error) {
            console.error("Error fetching lists:", error);
            setError("Failed to load your lists. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const createList = async () => {
        if (!newListName.trim()) {
            setError("List name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/lists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify({
                    name: newListName,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create list");
            }

            const data = await response.json();
            setLists([...lists, data]);
            setNewListName("");
            setIsCreating(false);
            setSuccessMessage("List created successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error creating list:", error);
            setError("Failed to create list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateList = async (listId) => {
        if (!editingListName.trim()) {
            setError("List name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/lists/${listId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify({
                    name: editingListName,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update list");
            }

            const updatedLists = lists.map((list) =>
                list.id === listId ? { ...list, name: editingListName } : list
            );

            setLists(updatedLists);
            setEditingListId(null);
            setEditingListName("");
            setSuccessMessage("List updated successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error updating list:", error);
            setError("Failed to update list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const deleteList = async (listId) => {
        if (!confirm("Are you sure you want to delete this list?")) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/lists/${listId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete list");
            }

            setLists(lists.filter((list) => list.id !== listId));
            setSuccessMessage("List deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Error deleting list:", error);
            setError("Failed to delete list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const addGameToList = async (listId) => {
        if (!gameId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/lists/${listId}/games`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": token,
                },
                body: JSON.stringify({
                    game_id: gameId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add game to list");
            }

            setSuccessMessage("Game added to list successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

            // Update the lists to reflect the change
            fetchUserLists();
        } catch (error) {
            console.error("Error adding game to list:", error);
            setError("Failed to add game to list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeGameFromList = async (listId) => {
        if (!gameId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/lists/${listId}/games/${gameId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": token,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to remove game from list");
            }

            setSuccessMessage("Game removed from list successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

            // Update the lists to reflect the change
            fetchUserLists();
        } catch (error) {
            console.error("Error removing game from list:", error);
            setError("Failed to remove game from list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isGameInList = (list) => {
        if (!gameId || !list.games) return false;
        return list.games.some((game) => game.id === Number.parseInt(gameId));
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">My Lists</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button
                        className="float-right font-bold"
                        onClick={() => setError(null)}
                    >
                        &times;
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            <ul className="space-y-2 mb-4">
                {lists.map((list) => (
                    <li
                        key={list.id}
                        className="border rounded-lg p-3 flex justify-between items-center"
                    >
                        {editingListId === list.id ? (
                            <div className="flex items-center w-full">
                                <input
                                    type="text"
                                    value={editingListName}
                                    onChange={(e) =>
                                        setEditingListName(e.target.value)
                                    }
                                    className="border rounded px-2 py-1 mr-2 flex-grow"
                                    autoFocus
                                />
                                <button
                                    onClick={() => updateList(list.id)}
                                    className="text-green-600 hover:text-green-800 mr-2"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingListId(null);
                                        setEditingListName("");
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center">
                                    <span className="font-medium">
                                        {list.name}
                                    </span>
                                    {list.is_favorite && (
                                        <span className="ml-2 text-yellow-500 text-xs">
                                            (Favorites)
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    {gameId &&
                                        (isGameInList(list) ? (
                                            <button
                                                onClick={() =>
                                                    removeGameFromList(list.id)
                                                }
                                                className="text-red-600 hover:text-red-800 mr-2"
                                                title="Remove from list"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    addGameToList(list.id)
                                                }
                                                className="text-blue-600 hover:text-blue-800 mr-2"
                                                title="Add to list"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        ))}
                                    {!list.is_favorite && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingListId(list.id);
                                                    setEditingListName(
                                                        list.name
                                                    );
                                                }}
                                                className="text-gray-600 hover:text-gray-800 mr-2"
                                                title="Edit list"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteList(list.id)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete list"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {isCreating ? (
                <div className="border rounded-lg p-3 mb-4">
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter list name"
                        className="border rounded px-2 py-1 w-full mb-2"
                        autoFocus
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setIsCreating(false);
                                setNewListName("");
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createList}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >
                            Create
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <Plus size={18} className="mr-1" /> Create New List
                </button>
            )}
        </div>
    );
}
