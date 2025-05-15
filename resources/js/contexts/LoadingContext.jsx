// contexts/LoadingContext.jsx
import { createContext, useContext, useState } from "react";

// Crear el contexto de carga
const LoadingContext = createContext();

// Hook personalizado para usar el contexto
export const useLoading = () => useContext(LoadingContext);

// Proveedor de carga
export const LoadingProvider = ({ children }) => {
    const [isLoading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};