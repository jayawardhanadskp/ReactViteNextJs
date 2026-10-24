// RECIPE DETAIL  →  URL: /recipes/pol-roti
// [id] in the folder name = a dynamic segment (Flutter go_router: '/recipes/:id').
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteRecipeButton } from '@/components/DeleteRecipeButton'
import { LikeButton } from '@/components/LikeButton'
import { deleteRecipeAction } from '@/lib/actions'
import { getRecipe, getRecipes } from '@/lib/recipes'
import { CATEGORY_LABELS } from '@/lib/types'

// Prerender a page for every recipe that exists at BUILD time (SSG).
// Recipes added later are rendered on their first visit, then cached.
export async function generateStaticParams() {
  const recipes = await getRecipes()
  return recipes.map((recipe) => ({ id: recipe.id }))
}

// The <title> and description of each recipe page (good for SEO and link previews)
export async function generateMetadata(props: PageProps<'/recipes/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const recipe = await getRecipe(id)
  return recipe ? { title: recipe.title, description: recipe.description } : { title: 'Recipe not found' }
}

export default async function RecipePage(props: PageProps<'/recipes/[id]'>) {
  const { id } = await props.params // params is a Promise in Next.js 15+
  const recipe = await getRecipe(id)

  if (!recipe) notFound() // shows app/recipes/[id]/not-found.tsx

  return (
    <article className="flex flex-col gap-8">
      <Link href="/recipes" className="text-sm text-stone-500 hover:text-orange-600">
        ← All recipes
      </Link>

      <header className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-orange-600">{CATEGORY_LABELS[recipe.category]}</span>
        <h1 className="text-4xl font-extrabold">{recipe.title}</h1>
        <p className="text-lg text-stone-600 dark:text-stone-400">{recipe.description}</p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="rounded-full bg-stone-200 px-3 py-1 text-sm dark:bg-stone-800">⏱ {recipe.minutes} min</span>
          <span className="rounded-full bg-stone-200 px-3 py-1 text-sm dark:bg-stone-800">🍽 Serves {recipe.servings}</span>
          {/* Client component inside a server component — only this button ships JS */}
          <LikeButton recipeId={recipe.id} likes={recipe.likes} />
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
          <h2 className="text-xl font-bold">Ingredients</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Steps</h2>
          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* A form in a SERVER component that calls a SERVER action. .bind() passes the id. */}
      <form action={deleteRecipeAction.bind(null, recipe.id)} className="border-t border-stone-200 pt-6 dark:border-stone-800">
        <DeleteRecipeButton title={recipe.title} />
      </form>
    </article>
  )
}
