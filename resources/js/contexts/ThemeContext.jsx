import { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto con un valor predeterminado
const ThemeContext = createContext({
    theme: "dark", // Modo oscuro por defecto
    toggleTheme: () => {},
});

// Hook personalizado para usar el contexto del tema
export function useTheme() {
    return useContext(ThemeContext);
}

// Proveedor del tema
export function ThemeProvider({ children }) {
    // Inicializar el estado del tema con el valor predeterminado
    const [theme, setTheme] = useState("dark");

    // Cargar el tema desde localStorage al renderizar inicialmente
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                setTheme(savedTheme); // Usar el tema guardado
            } else {
                setTheme("dark"); // Establecer el modo oscuro como predeterminado
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
        }
    }, []);

    // Actualizar la clase del documento y localStorage cuando cambia el tema
    useEffect(() => {
        // Aplicar el tema al documento completo
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);

        // Guardar el tema en localStorage
        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            console.error("Error writing to localStorage:", error);
        }
    }, [theme]);

    // Alternar entre temas claro y oscuro
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // Proveer el contexto del tema a los hijos
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Exportar el contexto y el proveedor
export { ThemeContext };