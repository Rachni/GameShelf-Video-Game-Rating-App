import { useState, useEffect } from "react";
import axios from "axios";
import { GameCard } from "../components/GameCard";
import { ReviewCard } from "../components/ReviewCard";
import { useTheme } from "../contexts/ThemeContext";
import { useLoading } from "../contexts/LoadingContext";

export function Home() {
    const [topGames, setTopGames] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const { theme } = useTheme();
    const { setLoading } = useLoading();

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [gamesResponse, reviewsResponse] = await Promise.all([
                    axios.get("/api/top-games?limit=10"),
                    axios.get("/api/reviews/recent?limit=4"),
                ]);

                console.log("API Responses:", {
                    games: gamesResponse.data,
                    reviews: reviewsResponse.data,
                });

                // Handle games response
                const gamesData = Array.isArray(gamesResponse.data)
                    ? gamesResponse.data
                    : gamesResponse.data?.data || [];

                // Format reviews data
                const formattedReviews = (reviewsResponse.data || []).map(
                    (review) => ({
                        ...review,
                        user: {
                            id: review.user?.id,
                            username:
                                review.user?.username ||
                                `user-${review.user?.id}`,
                            name: review.user?.name,
                            avatar: review.user?.profile_pic,
                        },
                        game: {
                            id: review.game?.id,
                            name: review.game?.name,
                            slug: review.game?.slug,
                            image_url: review.game?.image_url,
                        },
                        text: review.text,
                        star_rating: review.star_rating,
                        likes: review.likes || 0,
                        created_at: review.created_at,
                    })
                );

                setTopGames(gamesData);
                setRecentReviews(formattedReviews);
            } catch (error) {
                console.error("Error fetching home data:", error);
                setTopGames([]);
                setRecentReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [setLoading]);

    return (
        <div
            className={`container mx-auto px-4 py-8 ${
                theme === "dark" ? "dark" : ""
            }`}
        >
            {/* Hero Section */}
            <section className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
                    Discover & Share Game Experiences
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Find your next favorite game and see what the community is
                    saying about the latest releases.
                </p>
            </section>

            {/* Top Rated Games Section */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold dark:text-white flex items-center">
                        <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mr-3"></span>
                        Top Rated Games
                    </h2>
                    <a
                        href="/games"
                        className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:hover:text-purple-400 transition-colors"
                    >
                        View All →
                    </a>
                </div>

                {topGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {topGames.map((game) => (
                            <GameCard
                                key={game.id}
                                game={{
                                    ...game,
                                    genres: game.genres || [],
                                    platforms: game.platforms || [],
                                    stores: game.stores || [],
                                }}
                                className="transition-transform hover:scale-105 hover:shadow-xl"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No top-rated games available. Check back later!
                        </p>
                        <a
                            href="/games"
                            className="mt-4 inline-block px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Browse All Games
                        </a>
                    </div>
                )}
            </section>

            {/* Recent Reviews Section */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold dark:text-white flex items-center">
                        <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full mr-3"></span>
                        Community Reviews
                    </h2>
                    
                </div>

                {recentReviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {recentReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                showUser={true}
                                showGame={true}
                                showGameImage={true}
                                className="hover:shadow-lg transition-all"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No reviews yet. Be the first to review a game!
                        </p>
                        <a
                            href="/games"
                            className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-full hover:shadow-md transition-all"
                        >
                            Browse Games
                        </a>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">
                    Ready to share your thoughts?
                </h3>
                <p className="mb-6 max-w-2xl mx-auto opacity-90">
                    Join our community of gamers and start reviewing your
                    favorite games today!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="/register"
                        className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Sign Up
                    </a>
                    <a
                        href="/games"
                        className="px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Browse Games
                    </a>
                    <a
                        href="/reviews/create"
                        className="px-6 py-3 bg-black bg-opacity-20 text-white font-medium rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                        Write a Review
                    </a>
                </div>
            </section>
        </div>
    );
}
