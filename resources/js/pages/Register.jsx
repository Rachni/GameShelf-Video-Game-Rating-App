"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const response = await fetch("/api/auth/register", {
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
                setErrors(
                    data.errors || {
                        general: data.message || "Registration failed",
                    }
                );
                setSubmitting(false);
                return;
            }

            login(data.user, data.token);
            navigate("/");
        } catch (error) {
            console.error("Registration error:", error);
            setErrors({
                general: "An unexpected error occurred. Please try again.",
            });
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Form Container */}
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
                    {/* Header with accent color */}
                    <div className="bg-[#FF0059] p-6 text-center">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">Create Account</h2>
                        <p className="text-pink-100 mt-1">Join our community</p>
                    </div>
                    
                    <div className="p-8">
                        {errors.general && (
                            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl border-l-4 border-red-500 animate-pulse">
                                <span className="font-bold">⚠️ Error:</span> {errors.general}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.name ? "border-red-300" : "border-gray-200"} focus:border-[#FF0059] focus:ring-2 focus:ring-pink-200 bg-white text-gray-900 placeholder-gray-300 transition-all shadow-inner`}
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.email ? "border-red-300" : "border-gray-200"} focus:border-[#FF0059] focus:ring-2 focus:ring-pink-200 bg-white text-gray-900 placeholder-gray-300 transition-all shadow-inner`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.password ? "border-red-300" : "border-gray-200"} focus:border-[#FF0059] focus:ring-2 focus:ring-pink-200 bg-white text-gray-900 placeholder-gray-300 transition-all shadow-inner`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.password_confirmation ? "border-red-300" : "border-gray-200"} focus:border-[#FF0059] focus:ring-2 focus:ring-pink-200 bg-white text-gray-900 placeholder-gray-300 transition-all shadow-inner`}
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#FF0059] hover:bg-[#E00050] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </>
                                ) : (
                                    <span className="drop-shadow-md">Register Now</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <a href="/login" className="text-[#FF0059] hover:text-[#E00050] font-medium underline">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};