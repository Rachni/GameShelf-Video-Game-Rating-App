import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Plus, Trash2, Edit2, Save } from "lucide-react";

export function UserSettings() {
    const [error, setError] = useState(null);
    const { user, logout, token, checkAuth } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        bio: "",
        profile_pic: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || "",
                profile_pic: user.profile_pic || "",
            });
        }
    }, [user, navigate]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.put(
                "/api/user/profile",
                {
                    name: profileData.name,
                    email: profileData.email,
                    bio: profileData.bio,
                    profile_pic: profileData.profile_pic,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            setSuccessMessage("Profile updated successfully");
        } catch (error) {
            console.error("Profile update error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: "An error occurred. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        if (passwordData.password !== passwordData.password_confirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            setIsLoading(false);
            return;
        }

        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.post(
                "/api/user/password",
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                }
            );

            setSuccessMessage("Password updated successfully");
            setPasswordData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (error) {
            console.error("Password update error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: "An error occurred. Please try again." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== "DELETE") return;

        setIsLoading(true);
        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) throw new Error("Session expired");

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.delete("/api/user", {
                data: { confirmation: "DELETE" },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                withCredentials: true,
            });

            if (response.data.success) {
                await logout();
                navigate("/", {
                    state: {
                        accountDeleted: true,
                        message: "Your account has been permanently deleted",
                    },
                });
            }
        } catch (error) {
            console.error("Account deletion error:", error);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                await logout();
                navigate("/login");
            } else {
                alert(
                    error.response?.data?.message ||
                        "Failed to delete account. Please try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-heading mb-8">
                Account Settings
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="md:w-56">
                    <div
                        className={`p-4 rounded-lg bg-white dark:bg-header shadow-md`}
                    >
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                    activeTab === "profile"
                                        ? "bg-heading text-white"
                                        : "text-textLight dark:text-textDark hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                    activeTab === "password"
                                        ? "bg-heading text-white"
                                        : "text-textLight dark:text-textDark hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                Password
                            </button>
                            <button
                                onClick={() => setActiveTab("danger")}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                    activeTab === "danger"
                                        ? "bg-red-600 text-white"
                                        : "text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                }`}
                            >
                                Danger Zone
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div
                        className={`p-6 rounded-lg bg-white dark:bg-header shadow-md`}
                    >
                        {successMessage && (
                            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {successMessage}
                            </div>
                        )}

                        {errors.general && (
                            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {errors.general}
                            </div>
                        )}

                        {/* Profile Settings */}
                        {activeTab === "profile" && (
                            <form onSubmit={handleProfileSubmit}>
                                <h2 className="text-xl font-semibold text-heading dark:text-textDark mb-6">
                                    Profile Settings
                                </h2>

                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={
                                                profileData.profile_pic ||
                                                "/images/default-avatar.png"
                                            }
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover mr-4"
                                        />
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                                Profile Picture URL
                                            </label>
                                            <input
                                                type="url"
                                                name="profile_pic"
                                                value={profileData.profile_pic}
                                                onChange={handleProfileChange}
                                                placeholder="https://example.com/profile.jpg"
                                                className={`w-full p-2 rounded-md border ${
                                                    theme === "dark"
                                                        ? "bg-gray-700 border-gray-600 text-textDark"
                                                        : "bg-white border-gray-300 text-textLight"
                                                } focus:outline-none focus:ring-2 focus:ring-heading ${
                                                    errors.profile_pic
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {errors.profile_pic && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.profile_pic}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.name ? "border-red-500" : ""
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        Email
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.email ? "border-red-500" : ""
                                        }`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleProfileChange}
                                        rows={3}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.bio ? "border-red-500" : ""
                                        }`}
                                    />
                                    {errors.bio && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.bio}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-heading text-white rounded-md hover:bg-[#E00050] focus:outline-none focus:ring-2 focus:ring-heading focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}

                        {/* Password Settings */}
                        {activeTab === "password" && (
                            <form onSubmit={handlePasswordSubmit}>
                                <h2 className="text-xl font-semibold text-heading dark:text-textDark mb-6">
                                    Change Password
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        name="current_password"
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.current_password
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.current_password && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        New Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordChange}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.password
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-textLight dark:text-textDark mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        name="password_confirmation"
                                        type="password"
                                        value={
                                            passwordData.password_confirmation
                                        }
                                        onChange={handlePasswordChange}
                                        className={`w-full p-2 rounded-md border ${
                                            theme === "dark"
                                                ? "bg-gray-700 border-gray-600 text-textDark"
                                                : "bg-white border-gray-300 text-textLight"
                                        } focus:outline-none focus:ring-2 focus:ring-heading ${
                                            errors.password_confirmation
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-heading text-white rounded-md hover:bg-[#E00050] focus:outline-none focus:ring-2 focus:ring-heading focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </form>
                        )}

                        {/* Danger Zone */}
                        {activeTab === "danger" && (
                            <div>
                                <h2 className="text-xl font-semibold text-red-600 mb-6">
                                    Danger Zone
                                </h2>

                                <div
                                    className={`p-4 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20`}
                                >
                                    <h3 className="text-lg font-medium text-red-600 mb-2">
                                        Delete Account
                                    </h3>
                                    <p className="mb-4 text-textLight dark:text-textDark">
                                        Once you delete your account, there is
                                        no going back. All your data will be
                                        permanently removed. Please be certain.
                                    </p>

                                    {!showDeleteConfirmation ? (
                                        <button
                                            onClick={() =>
                                                setShowDeleteConfirmation(true)
                                            }
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            Delete Account Permanently
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-red-600 font-medium">
                                                Type "DELETE" to confirm account
                                                deletion:
                                            </p>
                                            <input
                                                type="text"
                                                value={deleteConfirmationText}
                                                onChange={(e) =>
                                                    setDeleteConfirmationText(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-2 border rounded-md"
                                                placeholder="Type DELETE"
                                            />
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={
                                                        handleDeleteAccount
                                                    }
                                                    disabled={
                                                        deleteConfirmationText !==
                                                            "DELETE" ||
                                                        isLoading
                                                    }
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex-1"
                                                >
                                                    {isLoading
                                                        ? "Deleting..."
                                                        : "Confirm Deletion"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirmation(
                                                            false
                                                        );
                                                        setDeleteConfirmationText(
                                                            ""
                                                        );
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex-1"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
