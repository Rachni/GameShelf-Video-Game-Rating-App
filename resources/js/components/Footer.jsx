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
                    ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300"
                    : "bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700"
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
                                className="w-25 h-10"
                            />
                        </Link>
                        <p className="mt-2 text-sm max-w-xs">
                            Track, rate, and discover your next favorite video
                            game.
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                                        className="text-sm hover:text-primary transition-colors duration-300"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/search"
                                        className="text-sm hover:text-primary transition-colors duration-300"
                                    >
                                        Browse Games
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm hover:text-primary transition-colors duration-300"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm hover:text-primary transition-colors duration-300"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Redes sociales */}
                        <div>
                            <h3 className="font-semibold mb-4">Connect</h3>
                            <div className="flex space-x-4">
                                <a
                                    href="https://github.com/Rachni"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors duration-300"
                                    aria-label="GitHub"
                                >
                                    <Github size={24} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Derechos de autor */}
                <div className="mt-12 pt-8 border-t border-gray-700 dark:border-gray-600 text-center text-sm">
                    <p>&copy; {currentYear} GameShelf.</p>
                    <p className="mt-1">
                        Powered by{" "}
                        <a
                            href="https://rawg.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline transition-colors duration-300"
                        >
                            RAWG API
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
