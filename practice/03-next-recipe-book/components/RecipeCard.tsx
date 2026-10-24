// No 'use client' and no hooks → this works as a Server Component.
// It sends ZERO JavaScript to the browser — only HTML.
import Link from 'next/link'
import { CATEGORY_LABELS, type Recipe } from '@/lib/types'

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <span className="text-xs font-semibold text-orange-600">{CATEGORY_LABELS[recipe.category]}</span>
      <h3 className="text-lg font-bold group-hover:text-orange-600">{recipe.title}</h3>
      <p className="line-clamp-2 text-sm text-stone-600 dark:text-stone-400">{recipe.description}</p>
      <div className="mt-auto flex gap-4 pt-2 text-sm text-stone-500">
        <span>⏱ {recipe.minutes} min</span>
        <span>🍽 {recipe.servings}</span>
        <span>❤️ {recipe.likes}</span>
      </div>
    </Link>
  )
}

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
