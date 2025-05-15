import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react({
            jsxRuntime: "automatic",
            fastRefresh: true,
        }),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
    optimizeDeps: {
        include: ["react", "react-dom", "react-router-dom"],
    },
    esbuild: {
        loader: "jsx",
        include: /\.[jt]sx?$/,
        exclude: [],
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:8000", // URL de tu backend de Laravel
                changeOrigin: true, // Cambia el origen de la solicitud al backend
                secure: false, // Desactiva la verificación de certificados SSL (útil en desarrollo)
            },
        },
    },
});