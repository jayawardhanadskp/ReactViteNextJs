// RECIPE LIST  →  URL: /recipes?q=coconut&category=main
// The page itself is static (heading + search form). The RESULTS depend on the URL's
// search params, which are only known at request time, so they stream inside <Suspense>.
import type { Metadata } from 'next'
import Form from 'next/form'
import { Suspense } from 'react'
import { RecipeGrid } from '@/components/RecipeCard'
import { searchRecipes } from '@/lib/recipes'
import { CATEGORIES, CATEGORY_LABELS, isCategory } from '@/lib/types'

export const metadata: Metadata = { title: 'All recipes' }

export default function RecipesPage(props: PageProps<'/recipes'>) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">All recipes</h1>

      {/* next/form: a GET form that navigates to /recipes?q=...&category=... without a full reload.
          It even works with JavaScript disabled (then it's a normal HTML form). */}
      <Form action="/recipes" className="flex flex-wrap gap-2">
        <input
          name="q"
          placeholder="Search by name or ingredient…"
          aria-label="Search"
          className="min-w-48 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        />
        <select
          name="category"
          aria-label="Category"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
          Search
        </button>
      </Form>

      <Suspense fallback={<p className="text-stone-500">Searching recipes…</p>}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}

async function SearchResults({ searchParams }: Pick<PageProps<'/recipes'>, 'searchParams'>) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const category = isCategory(params.category) ? params.category : null
  const recipes = await searchRecipes(q, category)

  if (recipes.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-stone-300 p-10 text-center text-stone-500 dark:border-stone-700">
        No recipes found{q && <> for “{q}”</>}.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-500">
        {recipes.length} recipe{recipes.length === 1 ? '' : 's'}
        {q && <> matching “{q}”</>}
        {category && <> in {CATEGORY_LABELS[category]}</>}
      </p>
      <RecipeGrid recipes={recipes} />
    </div>
  )
}
