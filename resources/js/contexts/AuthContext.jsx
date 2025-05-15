"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            // Verificar si el token sigue siendo válido
            try {
                await axios.get("/api/auth/check", {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        Accept: "application/json",
                    },
                    withCredentials: true,
                });

                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Token validation failed:", error);
                logout();
            }
        }
        setIsLoading(false);
    };

    const login = async (userData, token) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);

        // Obtener el token CSRF después del login
        await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
    };

    const logout = async () => {
        try {
            await axios.post(
                "/api/auth/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
    };

    const checkAuth = async () => {
        if (!token) return false;

        try {
            const response = await axios.get("/api/auth/check", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                withCredentials: true,
            });
            return response.data.authenticated;
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
            return false;
        }
    };

    const contextData = {
        isAuthenticated,
        user,
        token,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
