import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Github, Twitter } from "lucide-react";

export function Footer() {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={`py-12 ${
                theme === "dark"
                    ? "bg-header text-textDark" // Fondo azul oscuro y texto claro en modo noche
                    : "bg-lightBg text-textLight" // Fondo blanco y texto oscuro en modo día
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    {/* Logo y descripción */}
                    <div className="mb-8 md:mb-0">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="w-40"
                            />
                        </Link>
                        <p className="mt-2 text-sm max-w-xs">
                            Track, rate, and discover your next favorite video
                            game.
                        </p>
                        <p
                            className={`mt-1 text-xs ${
                                theme === "dark"
                                    ? "text-textDark/70"
                                    : "text-textLight/70"
                            }`}
                        >
                            Developed by Rachni
                        </p>
                    </div>

                    {/* Enlaces y redes sociales */}
                    <div className="flex flex-col md:flex-row md:space-x-12">
                        {/* Enlaces rápidos */}
                        <div className="mb-8 md:mb-0">
                            <h3 className="font-semibold mb-4">Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        to="/"
                                        className={`text-sm hover:text-interactive transition-colors duration-300 ${
                                            theme === "dark"
                                                ? "text-textDark"
                                                : "text-textLight"
                                        }`}
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/search"
                                        className={`text-sm hover:text-interactive transition-colors duration-300 ${
                                            theme === "dark"
                                                ? "text-textDark"
                                                : "text-textLight"
                                        }`}
                                    >
                                        Browse Games
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={`text-sm hover:text-interactive transition-colors duration-300 ${
                                            theme === "dark"
                                                ? "text-textDark"
                                                : "text-textLight"
                                        }`}
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={`text-sm hover:text-interactive transition-colors duration-300 ${
                                            theme === "dark"
                                                ? "text-textDark"
                                                : "text-textLight"
                                        }`}
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Redes sociales */}
                        <div>
                            <h3
                                className={`font-semibold mb-4 ${
                                    theme === "dark"
                                        ? "text-textDark"
                                        : "text-textLight"
                                }`}
                            >
                                Connect
                            </h3>
                            <div className="flex space-x-4">
                                <a
                                    href="https://github.com/Rachni"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`hover:text-interactive transition-colors duration-300 ${
                                        theme === "dark"
                                            ? "text-textDark"
                                            : "text-textLight"
                                    }`}
                                    aria-label="GitHub"
                                >
                                    <Github size={24} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Derechos de autor */}
                <div
                    className={`mt-12 pt-8 border-t ${
                        theme === "dark"
                            ? "border-header/30"
                            : "border-gray-200"
                    } text-center text-sm ${
                        theme === "dark"
                            ? "text-textDark/80"
                            : "text-textLight/80"
                    }`}
                >
                    <p>&copy; {currentYear} GameShelf.</p>
                    <p className="mt-1">
                        Powered by{" "}
                        <a
                            href="https://rawg.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-interactive hover:underline transition-colors duration-300"
                        >
                            RAWG API
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
