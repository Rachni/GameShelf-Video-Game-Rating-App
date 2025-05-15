import React from "react";
import "./bootstrap";
import "../css/app.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MainApp } from "./MainApp";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext"; // Importar el LoadingProvider

// Get the root element
const container = document.getElementById("app");
const root = createRoot(container);

// Render the app
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <LoadingProvider>
                        {" "}
                        <MainApp />
                    </LoadingProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
