'use server'
// SERVER ACTIONS: functions that run on the server but can be called from forms and buttons
// in the browser. Next.js creates the HTTP endpoint for you.
// ⚠️ Anyone can call them with a POST request, so ALWAYS validate input here
// (and in a real app, check the user is logged in and allowed to do this).
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { addRecipe, deleteRecipe, likeRecipe } from './recipes'
import { isCategory } from './types'

export type RecipeFormState = {
  errors?: Partial<Record<'title' | 'description' | 'category' | 'minutes' | 'servings' | 'ingredients' | 'steps', string>>
  values?: Record<string, string> // what the user typed, so the form can show it again after an error
}

function lines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
}

// Used with useActionState → receives the previous state first, then the FormData.
export async function createRecipeAction(_prev: RecipeFormState, formData: FormData): Promise<RecipeFormState> {
  const values = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    category: String(formData.get('category') ?? ''),
    minutes: String(formData.get('minutes') ?? ''),
    servings: String(formData.get('servings') ?? ''),
    ingredients: String(formData.get('ingredients') ?? ''),
    steps: String(formData.get('steps') ?? ''),
  }

  const errors: RecipeFormState['errors'] = {}
  const minutes = Number(values.minutes)
  const servings = Number(values.servings)

  if (values.title.length < 3) errors.title = 'Title must be at least 3 characters.'
  if (values.description.length < 10) errors.description = 'Write at least 10 characters.'
  if (!isCategory(values.category)) errors.category = 'Choose a category.'
  if (!Number.isInteger(minutes) || minutes <= 0) errors.minutes = 'Enter the minutes as a whole number above 0.'
  if (!Number.isInteger(servings) || servings <= 0) errors.servings = 'Enter servings as a whole number above 0.'
  if (lines(values.ingredients).length === 0) errors.ingredients = 'Add at least one ingredient (one per line).'
  if (lines(values.steps).length === 0) errors.steps = 'Add at least one step (one per line).'

  // Expected errors are RETURNED (not thrown), so the form can show them.
  if (Object.keys(errors).length > 0 || !isCategory(values.category)) {
    return { errors, values }
  }

  const recipe = await addRecipe({
    title: values.title,
    description: values.description,
    category: values.category,
    minutes,
    servings,
    ingredients: lines(values.ingredients),
    steps: lines(values.steps),
  })

  updateTag('recipes') // expire every cached read tagged 'recipes' → fresh data on the next render
  redirect(`/recipes/${recipe.id}`) // throws internally — code after this line never runs
}

export async function likeRecipeAction(id: string): Promise<number> {
  const likes = await likeRecipe(id)
  updateTag('recipes')
  return likes
}

// Bound with the id in the page: deleteRecipeAction.bind(null, recipe.id)
export async function deleteRecipeAction(id: string): Promise<void> {
  await deleteRecipe(id)
  updateTag('recipes')
  redirect('/recipes')
}
