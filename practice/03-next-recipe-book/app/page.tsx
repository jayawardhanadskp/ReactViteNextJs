// HOME PAGE  →  URL: /
// A Server Component: it can be `async` and read data directly. No useEffect, no loading state.
// getRecipes() is cached ('use cache'), so this whole page is prerendered to static HTML at build time.
import Link from 'next/link'
import { RecipeGrid } from '@/components/RecipeCard'
import { getRecipes } from '@/lib/recipes'

export default async function HomePage() {
  const recipes = await getRecipes()
  const mostLiked = recipes.toSorted((a, b) => b.likes - a.likes).slice(0, 3)
  const totalMinutes = recipes.reduce((sum, r) => sum + r.minutes, 0)

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 p-8 text-white sm:p-12">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Cook something Sri Lankan today.</h1>
        <p className="max-w-xl text-lg text-orange-50">
          {recipes.length} recipes, {totalMinutes} minutes of cooking. Rendered on the server with Next.js.
        </p>
        <div className="flex gap-3">
          <Link href="/recipes" className="rounded-full bg-white px-5 py-2 font-semibold text-orange-600 hover:bg-orange-50">
            Browse recipes
          </Link>
          <Link href="/recipes/new" className="rounded-full border border-white/60 px-5 py-2 font-semibold hover:bg-white/10">
            Add your own
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">❤️ Most liked</h2>
        <RecipeGrid recipes={mostLiked} />
      </section>
    </div>
  )
}
