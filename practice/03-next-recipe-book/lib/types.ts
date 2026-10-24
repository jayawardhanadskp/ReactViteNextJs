// Types and constants shared by server AND client code.
// (This file must not import anything server-only, because client components import it.)

export const CATEGORIES = ['breakfast', 'main', 'dessert', 'drink'] as const
export type Category = (typeof CATEGORIES)[number] // 'breakfast' | 'main' | 'dessert' | 'drink'

export const CATEGORY_LABELS: Record<Category, string> = {
  breakfast: '🍳 Breakfast',
  main: '🍛 Main',
  dessert: '🍮 Dessert',
  drink: '🥤 Drink',
}

export type Recipe = {
  id: string
  title: string
  description: string
  category: Category
  minutes: number
  servings: number
  ingredients: string[]
  steps: string[]
  likes: number
  createdAt: string
}

export type NewRecipeInput = Omit<Recipe, 'id' | 'likes' | 'createdAt'>

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}
