import { Link } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

export function GameListPreview({ list }) {
  const { theme } = useTheme()

  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{list.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {list.games_count} games • Created by {list.user.name}
        </p>

        {list.games && list.games.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {list.games.slice(0, 4).map((game) => (
              <div key={game.id} className="aspect-video relative rounded overflow-hidden">
                <img
                  src={game.background_image || "/placeholder.svg?height=100&width=200"}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                  <span className="text-white text-xs p-2 truncate">{game.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic mb-4">This list is empty</p>
        )}

        <Link
          to={`/lists/${list.id}`}
          className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          View List
        </Link>
      </div>
    </div>
  )
}

