"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SearchBar } from "./SearchBar";

export const Header = ({ toggleSearchBar }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        document.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            document.removeEventListener("scroll", handleScroll);
        };
    }, [scrolled]);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
        setShowUserMenu(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header
            className={`
            fixed top-0 left-0 right-0 z-50 
            transition-all duration-300 
            ${
                scrolled
                    ? "shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
                    : "bg-white dark:bg-gray-900"
            } 
            border-b border-gray-200 dark:border-gray-700
        `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="w-25 h-10"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <Link
                            to="/"
                            className="text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <Link
                            to="/games"
                            className="text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Games
                        </Link>
                    </div>

                    {/* Right side icons */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                        {/* Search button */}
                        <button
                            onClick={toggleSearchBar}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            aria-label="Search"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        {isAuthenticated ? (
                            <div className="ml-4 relative" ref={userMenuRef}>
                                <div>
                                    <button
                                        onClick={toggleUserMenu}
                                        className="flex items-center max-w-xs rounded-full focus:outline-none"
                                        aria-label="User menu"
                                    >
                                        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#FF0059] hover:border-pink-500 transition-colors">
                                            {user?.avatar ? (
                                                <img
                                                    src={
                                                        user.avatar ||
                                                        "/images/default-avatar.png"
                                                    }
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-[#FF0059] to-pink-500">
                                                    <span className="text-white text-xs font-bold">
                                                        {user?.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {showUserMenu && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="py-1">
                                            <Link
                                                to={`/users/${user?.name}`}
                                                onClick={() =>
                                                    setShowUserMenu(false)
                                                }
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Your Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() =>
                                                    setShowUserMenu(false)
                                                }
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Settings
                                            </Link>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 ml-4">
                                <Link
                                    to="/login"
                                    className="text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 text-sm font-medium transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-md bg-gradient-to-r from-[#FF0059] to-pink-600 text-white text-sm font-medium hover:from-[#E00050] hover:to-pink-700 transition-all duration-200 shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition duration-150 ease-in-out"
                            aria-label="Toggle menu"
                        >
                            {showMobileMenu ? (
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {showMobileMenu && (
                <div className="md:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setShowMobileMenu(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <Link
                            to="/games"
                            onClick={() => setShowMobileMenu(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            Games
                        </Link>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center px-5">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#FF0059]">
                                            {user?.avatar ? (
                                                <img
                                                    src={
                                                        user.avatar ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-[#FF0059] to-pink-500">
                                                    <span className="text-white text-sm font-bold">
                                                        {user?.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-white">
                                            {user?.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <Link
                                        to={`/users/${user?.name}`}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        Your Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setShowMobileMenu(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <Link
                                    to="/login"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0059] dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="block w-full px-3 py-2 rounded-md bg-gradient-to-r from-[#FF0059] to-pink-600 text-white text-base font-medium hover:from-[#E00050] hover:to-pink-700 transition-all duration-200 shadow-sm text-center"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
