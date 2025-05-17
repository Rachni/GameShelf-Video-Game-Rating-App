/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.{js,jsx,ts,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                // Colores base
                header: "#2c3e50", // Color principal para el header
                darkBg: "#1f2833", // Fondo oscuro de la página
                lightBg: "#e5dfeb", // Fondo claro suave (blanco roto)

                // Colores interactivos
                interactive: "#00adb5", // Para botones y elementos clickables
                interactiveHover: "#008b92", // Versión más oscura para hover

                // Colores tipográficos
                heading: "#ff0059", // Color para encabezados
                textLight: "#334155", // Texto en modo claro (gris azulado oscuro)
                textDark: "#e2e8f0", // Texto en modo oscuro (gris claro)

                // Colores de acento y utilidades
                accent: {
                    DEFAULT: "#00adb5",
                    light: "#38f0f1", // Versión clara del turquesa
                    dark: "#008b92", // Versión oscura para hover
                },

                // Mantener compatibilidad con componentes existentes
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: "1rem",
                    sm: "2rem",
                    lg: "4rem",
                    xl: "5rem",
                },
            },
            // Extender tipografía para usar los colores definidos
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme("colors.textLight"),
                        h1: { color: theme("colors.heading") },
                        h2: { color: theme("colors.heading") },
                        h3: { color: theme("colors.heading") },
                        a: {
                            color: theme("colors.interactive"),
                            "&:hover": {
                                color: theme("colors.interactiveHover"),
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: theme("colors.textDark"),
                    },
                },
            }),
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/line-clamp"),
        require("tailwindcss-animate"),
    ],
};
