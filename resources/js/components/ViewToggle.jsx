"use client";

import { Grid, List } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ViewToggle({ view, onViewChange }) {
    const { theme } = useTheme();

    return (
        <div
            className={`inline-flex rounded-lg overflow-hidden border ${
                theme === "dark" ? "border-gray-700" : "border-gray-300"
            }`}
        >
            <button
                onClick={() => onViewChange("grid")}
                className={`flex items-center px-3 py-2 text-sm transition-colors ${
                    view === "grid"
                        ? theme === "dark"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-800"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-400 hover:text-gray-200"
                        : "bg-white text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Grid view"
                title="Grid view"
            >
                <Grid size={18} className="mr-1" />
                <span className="hidden sm:inline">Grid</span>
            </button>
            <button
                onClick={() => onViewChange("list")}
                className={`flex items-center px-3 py-2 text-sm transition-colors ${
                    view === "list"
                        ? theme === "dark"
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-800"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-400 hover:text-gray-200"
                        : "bg-white text-gray-500 hover:text-gray-700"
                }`}
                aria-label="List view"
                title="List view"
            >
                <List size={18} className="mr-1" />
                <span className="hidden sm:inline">List</span>
            </button>
        </div>
    );
}
