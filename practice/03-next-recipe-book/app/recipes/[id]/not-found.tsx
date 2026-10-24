// Shown when page.tsx calls notFound(). The response gets a 404 status.
import Link from 'next/link'

export default function RecipeNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-6xl">🥣</p>
      <h1 className="text-2xl font-bold">Recipe not found</h1>
      <p className="text-stone-500">It may have been deleted, or the link is wrong.</p>
      <Link href="/recipes" className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
        See all recipes
      </Link>
    </div>
  )
}
