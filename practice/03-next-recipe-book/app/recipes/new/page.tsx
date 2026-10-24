// NEW RECIPE  →  URL: /recipes/new
// A static folder name ("new") wins over the dynamic [id] folder, so /recipes/new comes here.
import type { Metadata } from 'next'
import { RecipeForm } from '@/components/RecipeForm'

export const metadata: Metadata = { title: 'New recipe' }

export default function NewRecipePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Add a recipe</h1>
        <p className="text-stone-500">It will be saved to data/recipes.json by a Server Action.</p>
      </div>
      <RecipeForm />
    </div>
  )
}
