"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";

export function MainLayout() {
    const [showSearchBar, setShowSearchBar] = useState(false);

    const toggleSearchBar = () => {
        setShowSearchBar((prev) => !prev);
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            <Header toggleSearchBar={toggleSearchBar} />

            {/* Barra de búsqueda posicionada debajo del header */}
            {showSearchBar && (
                <div className="fixed top-16 z-[110] w-full flex justify-center px-4 bg-white dark:bg-gray-900 shadow-md">
                    <div className="w-full max-w-4xl py-2">
                        <SearchBar onClose={toggleSearchBar} />
                    </div>
                </div>
            )}

            <main className="flex-grow container mx-auto px-4 py-6 mt-4">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
