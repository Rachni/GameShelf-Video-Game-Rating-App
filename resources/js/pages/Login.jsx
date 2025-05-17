"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || "/";

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                setSubmitting(false);
                return;
            }

            login(data.user, data.token);
            navigate(from || "/");
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-lightBg dark:bg-darkBg">
            <div className="w-full max-w-md">
                {/* Formulario */}
                <div className="bg-white dark:bg-header rounded-3xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700">
                    {/* Cabecera */}
                    <div className="bg-heading dark:bg-accent-dark p-6 text-center">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">
                            Welcome Back!
                        </h2>
                        <p className="text-pink-100 dark:text-accent-light mt-1">
                            Sign in to your account
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-xl border-l-4 border-red-500 dark:border-red-400 animate-pulse">
                                <span className="font-bold">⚠️ Error:</span>{" "}
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-textLight dark:text-textDark mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-heading dark:focus:border-accent focus:ring-2 focus:ring-pink-200 dark:focus:ring-accent-light bg-white dark:bg-gray-700 text-textLight dark:text-textDark placeholder-gray-400 dark:placeholder-gray-400 transition-all shadow-inner"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-textLight dark:text-textDark mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-heading dark:focus:border-accent focus:ring-2 focus:ring-pink-200 dark:focus:ring-accent-light bg-white dark:bg-gray-700 text-textLight dark:text-textDark placeholder-gray-400 dark:placeholder-gray-400 transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-heading dark:bg-accent hover:bg-[#E00050] dark:hover:bg-accent-dark text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <span className="drop-shadow-md">
                                        Sign In
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <a
                                href="#"
                                className="text-sm text-heading dark:text-accent hover:text-[#CC0047] dark:hover:text-accent-dark font-medium hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-textLight dark:text-textDark font-medium">
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="text-heading dark:text-accent hover:text-[#E00050] dark:hover:text-accent-dark font-bold underline"
                        >
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
