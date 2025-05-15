"use client";

import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

export function GenreChart({ data }) {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div
                className={`p-6 rounded-lg ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                } text-center`}
            >
                <p className="text-gray-500 dark:text-gray-400">
                    No genre data available
                </p>
            </div>
        );
    }

    // Colores para el gráfico
    const COLORS = [
        "#6366f1", // Indigo
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#ef4444", // Red
        "#f59e0b", // Amber
        "#10b981", // Emerald
        "#3b82f6", // Blue
        "#06b6d4", // Cyan
        "#14b8a6", // Teal
        "#84cc16", // Lime
    ];

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    // Formatear los datos para el gráfico
    const chartData = data.map((item) => ({
        name: item.name,
        value: item.count,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className={`p-2 rounded shadow-lg ${
                        theme === "dark"
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-800"
                    }`}
                >
                    <p className="font-medium">{payload[0].name}</p>
                    <p>
                        <span className="font-bold">{payload[0].value}</span>{" "}
                        games
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`p-6 rounded-lg ${
                theme === "dark"
                    ? "bg-gray-800"
                    : "bg-white border border-gray-200"
            } shadow-lg`}
        >
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={activeIndex !== null ? 110 : 100}
                            paddingAngle={2}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            animationDuration={500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={
                                        theme === "dark" ? "#1f2937" : "#ffffff"
                                    }
                                    strokeWidth={2}
                                    className="transition-all duration-300"
                                    style={{
                                        filter:
                                            activeIndex === index
                                                ? "brightness(1.2) drop-shadow(0 0 6px rgba(0,0,0,0.3))"
                                                : "none",
                                        transform:
                                            activeIndex === index
                                                ? "scale(1.05)"
                                                : "scale(1)",
                                        transformOrigin: "center",
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                paddingLeft: "10px",
                                fontSize: "12px",
                                color: theme === "dark" ? "#e5e7eb" : "#374151",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
