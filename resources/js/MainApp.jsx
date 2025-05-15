import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext";

// Layouts
import { MainLayout } from "./layouts/MainLayout";

// Pages
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { GameDetails } from "./pages/GameDetails";
import { UserProfile } from "./pages/UserProfile";
import { UserSettings } from "./pages/UserSettings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";
import { Games } from "./pages/Games";
import { GameListDetail } from "./pages/GameListDetail";

export function MainApp() {
    const { theme } = useTheme();

    // Apply theme class to body
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="games/:slug" element={<GameDetails />} />
                <Route path="users/:username" element={<UserProfile />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="/games" element={<Games />} />
                <Route
                    path="/users/:username/lists/:listId"
                    element={<GameListDetail />}
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
