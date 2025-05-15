import { Link } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { Home } from "lucide-react"

export function NotFound() {
  const { theme } = useTheme()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
      <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        <Home size={20} className="mr-2" />
        Back to Home
      </Link>
    </div>
  )
}

