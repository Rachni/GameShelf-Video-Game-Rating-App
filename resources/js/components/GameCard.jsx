import { useState } from "react";
import { Star, Calendar, Monitor, Gamepad2, Smartphone } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
};

const getPlatformIcon = (platformName) => {
    const name = platformName.toLowerCase();
    if (name.includes("pc") || name.includes("mac") || name.includes("linux")) {
        return <Monitor className="w-3.5 h-3.5" />;
    } else if (
        name.includes("playstation") ||
        name.includes("xbox") ||
        name.includes("nintendo") ||
        name.includes("switch")
    ) {
        return <Gamepad2 className="w-3.5 h-3.5" />;
    } else if (name.includes("ios") || name.includes("android")) {
        return <Smartphone className="w-3.5 h-3.5" />;
    }
    return <Gamepad2 className="w-3.5 h-3.5" />;
};

const generateColorsFromId = (id) => {
    const colorPalettes = [
        { dominant: "#6366f1", secondary: "#4f46e5" },
        { dominant: "#f59e0b", secondary: "#d97706" },
        { dominant: "#10b981", secondary: "#059669" },
        { dominant: "#ef4444", secondary: "#dc2626" },
        { dominant: "#8b5cf6", secondary: "#7c3aed" },
        { dominant: "#3b82f6", secondary: "#2563eb" },
        { dominant: "#ec4899", secondary: "#db2777" },
    ];
    const index =
        (typeof id === "number" ? id : parseInt(id, 10)) % colorPalettes.length;
    return colorPalettes[Math.abs(index)];
};

export function GameCard({ game, className }) {
    const {
        id,
        name: title,
        image_url: coverImage,
        average_rating,
        release_date,
        genres = [],
        platforms = [],
    } = game;

    const rating = parseFloat(average_rating);
    const formattedReleaseDate = formatDate(release_date);
    const genreNames = genres.map((genre) => genre.name);
    const platformNames = platforms
        .map((platform) => platform.name)
        .slice(0, 3);
    const url = `/games/${game.slug}`;
    const [isHovering, setIsHovering] = useState(false);
    const colors = generateColorsFromId(id);

    const renderStars = (rating) => {
        const maxStars = 5;
        return (
            <div className="flex gap-[2px]">
                {[...Array(maxStars)].map((_, i) => {
                    const starValue = i + 1;
                    return (
                        <Star
                            key={i}
                            className={cn(
                                "w-3.5 h-3.5",
                                starValue <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : starValue - 0.5 <= rating
                                    ? "fill-yellow-400 text-yellow-400 opacity-50"
                                    : "text-gray-400"
                            )}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <a href={url} className="block">
            <div
                className={cn(
                    "relative rounded-xl overflow-hidden transition-all duration-300 transform w-full max-w-xs h-[420px]",
                    isHovering ? "scale-[1.03] shadow-2xl z-10" : "shadow-md",
                    className
                )}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                    boxShadow: isHovering
                        ? `0 10px 25px rgba(0,0,0,0.25), 0 0 0 2px ${colors.dominant}40`
                        : `0 6px 12px rgba(0,0,0,0.15)`,
                }}
            >
                <div
                    className="absolute -inset-[1px] rounded-xl z-[-1] transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(135deg, ${colors.dominant}, ${colors.secondary})`,
                        opacity: isHovering ? 1 : 0.4,
                    }}
                />
                <div className="relative h-full flex flex-col bg-black/20 backdrop-blur-md rounded-xl">
                    {/* Imagen */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden">
                        <img
                            src={coverImage || "/placeholder.svg"}
                            alt={title}
                            className="object-cover w-full h-full transition-all duration-300 brightness-90"
                            onError={(e) => {
                                e.target.src = "/placeholder.svg";
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(to top, ${colors.secondary}80, rgba(0,0,0,0.3) 70%, transparent)`,
                            }}
                        />
                        <div
                            className="absolute top-2 right-2 px-2 py-0.5 rounded text-sm font-bold shadow"
                            style={{
                                background: `linear-gradient(135deg, ${colors.dominant}, ${colors.secondary})`,
                                boxShadow: `0 0 6px ${colors.dominant}80`,
                            }}
                        >
                            <span className="text-white">{rating.toFixed(1)}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-white z-10">
                            <div className="flex flex-wrap gap-1 mb-1">
                                {genreNames.slice(0, 2).map((genre, index) => (
                                    <span
                                        key={index}
                                        className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm"
                                        style={{
                                            backgroundColor: `${colors.dominant}20`,
                                            borderColor: `${colors.dominant}40`,
                                        }}
                                    >
                                        {genre}
                                    </span>
                                ))}
                                {genreNames.length > 2 && (
                                    <span
                                        className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm"
                                        style={{
                                            backgroundColor: `${colors.dominant}20`,
                                            borderColor: `${colors.dominant}40`,
                                        }}
                                    >
                                        +{genreNames.length - 2}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base font-semibold leading-tight drop-shadow-sm line-clamp-2">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Detalles */}
                    <div
                        className="px-3 py-2 space-y-2 text-white text-sm flex flex-col flex-grow"
                        style={{
                            background: `linear-gradient(to bottom, ${colors.dominant}20, ${colors.secondary}40)`,
                        }}
                    >
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">{formattedReleaseDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {renderStars(rating)}
                            <span className="text-xs text-white/70">
                                ({rating.toFixed(1)})
                            </span>
                        </div>
                        {platformNames.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {platformNames.map((platform, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 text-xs"
                                    >
                                        {getPlatformIcon(platform)}
                                        <span>{platform}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
}
