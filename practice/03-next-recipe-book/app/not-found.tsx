// Global 404 page for URLs that don't match any route
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-6xl">🗺️</p>
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <Link href="/" className="text-orange-600 underline">
        Go home
      </Link>
    </div>
  )
}
