// The DATA LAYER (like a repository class in Flutter).
// It reads and writes data/recipes.json. In a real app this would talk to a database
// (Postgres, MongoDB, Firebase...). The rest of the app would not change.
import 'server-only' // build error if a client component ever imports this file
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import type { Category, NewRecipeInput, Recipe } from './types'

const DATA_FILE = path.join(process.cwd(), 'data', 'recipes.json')

async function readAll(): Promise<Recipe[]> {
  const json = await readFile(DATA_FILE, 'utf-8')
  return JSON.parse(json) as Recipe[]
}

async function writeAll(recipes: Recipe[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(recipes, null, 2) + '\n', 'utf-8')
}

// ---------- READS (cached) ----------
// 'use cache' stores the result. Pages that use it can be prerendered into static HTML.
// cacheTag('recipes') gives the cache a name, so mutations can expire it with updateTag('recipes').

export async function getRecipes(): Promise<Recipe[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('recipes')

  const recipes = await readAll()
  return recipes.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)) // newest first
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('recipes')

  const recipes = await readAll()
  return recipes.find((r) => r.id === id) ?? null
}

export async function searchRecipes(query: string, category: Category | null): Promise<Recipe[]> {
  const recipes = await getRecipes()
  const q = query.trim().toLowerCase()
  return recipes.filter(
    (r) =>
      (category === null || r.category === category) &&
      (q === '' ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q))),
  )
}

// ---------- WRITES (only called from Server Actions in lib/actions.ts) ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function addRecipe(input: NewRecipeInput): Promise<Recipe> {
  const recipes = await readAll()
  const recipe: Recipe = {
    ...input,
    id: `${slugify(input.title) || 'recipe'}-${crypto.randomUUID().slice(0, 6)}`,
    likes: 0,
    createdAt: new Date().toISOString(),
  }
  await writeAll([...recipes, recipe])
  return recipe
}

export async function likeRecipe(id: string): Promise<number> {
  const recipes = await readAll()
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) throw new Error('Recipe not found')
  const likes = recipe.likes + 1
  await writeAll(recipes.map((r) => (r.id === id ? { ...r, likes } : r)))
  return likes
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await readAll()
  await writeAll(recipes.filter((r) => r.id !== id))
}
