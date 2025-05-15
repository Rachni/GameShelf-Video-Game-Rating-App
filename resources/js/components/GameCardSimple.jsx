"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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
        (typeof id === "number" ? id : Number.parseInt(id, 10)) %
        colorPalettes.length;
    return colorPalettes[Math.abs(index)];
};

export function GameCardSimple({ game, onRemove, className }) {
    const { id, name: title, image_url: coverImage, slug } = game;
    const url = `/games/${slug || id}`;
    const [isHovering, setIsHovering] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const colors = generateColorsFromId(id);

    const handleRemoveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleConfirmRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(id);
        setShowConfirm(false);
    };

    const handleCancelRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <Link to={url} className="block">
            <div
                className={cn(
                    "relative rounded-xl overflow-hidden transition-all duration-300 transform w-full max-w-xs h-[280px]",
                    isHovering ? "scale-[1.03] shadow-2xl z-10" : "shadow-md",
                    className
                )}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                    setIsHovering(false);
                    if (!showConfirm) {
                        setShowConfirm(false);
                    }
                }}
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
                    <div className="relative aspect-[2/3] w-full h-full overflow-hidden">
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
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-white z-10">
                            <h2 className="text-base font-semibold leading-tight drop-shadow-sm line-clamp-2">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Botón de eliminar */}
                    {onRemove && (
                        <div className="absolute top-2 left-2 z-20">
                            {showConfirm ? (
                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                                    <p className="text-white text-xs mb-2">
                                        Remove from list?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmRemove}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={handleCancelRemove}
                                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRemoveClick}
                                    className={`p-2 rounded-full transition-opacity duration-200 ${
                                        isHovering ? "opacity-100" : "opacity-0"
                                    } bg-red-600 hover:bg-red-700 text-white`}
                                    title="Remove from list"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
