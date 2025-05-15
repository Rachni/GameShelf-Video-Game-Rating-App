"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ListPlus } from "lucide-react";
import GameLists from "./GameLists";

export default function GameListButton({ gameId }) {
    const { user } = useContext(AuthContext);
    const [showLists, setShowLists] = useState(false);

    if (!user) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowLists(!showLists)}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors"
                title="Add to list"
            >
                <ListPlus size={18} className="mr-1" />
                <span>Add to list</span>
            </button>

            {showLists && (
                <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 right-0">
                    <GameLists gameId={gameId} />
                    <button
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => setShowLists(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
