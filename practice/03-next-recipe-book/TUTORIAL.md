# Guided Project #2 — Recipe Book (Next.js full-stack)

You will build a full-stack Next.js app **from scratch**: server-rendered pages, a data layer,
cached reads, Server Actions for create/like/delete, streaming search, loading/error/404 pages,
SEO metadata, and a JSON REST API that a **Flutter app** could call.

The finished app is in this folder. Run it first to see the goal:

```bash
cd practice/03-next-recipe-book
npm install
npm run dev        # http://localhost:3000
```

Then build your own copy in another folder, following the steps. Type the code; peek at the finished
files only when stuck. (Read the Next.js lessons 01–07 first.)

---

## What you will build

```
/                       Home: hero + "Most liked" recipes            (static, prerendered)
/recipes?q=&category=   Search form + streamed results                (static shell + Suspense)
/recipes/pol-roti       Recipe detail, ❤️ like button, delete         (SSG via generateStaticParams)
/recipes/new            Form with server-side validation              (Server Action + useActionState)
/api/recipes            JSON list of recipes                          (Route Handler)
/api/recipes/pol-roti   JSON of one recipe                            (Route Handler)
```

### Architecture

```
┌──────────────────────────────── Next.js server ────────────────────────────────┐
│                                                                                │
│  app/**/page.tsx (Server Components) ──read──▶ lib/recipes.ts ──▶ data/recipes.json
│        │                                  ('use cache' + cacheTag('recipes'))   │
│        │ renders                                    ▲                           │
│        ▼                                            │ write                     │
│  components/LikeButton, RecipeForm,                 │                           │
│  DeleteRecipeButton ('use client') ──call──▶ lib/actions.ts ('use server')      │
│                                              validate → write → updateTag()     │
│                                              → redirect()                       │
│  app/api/recipes/route.ts  ──read──▶ lib/recipes.ts   (JSON for other clients)   │
└────────────────────────────────────────────────────────────────────────────────┘
```

| This app                     | Flutter equivalent                                   |
| ---------------------------- | ---------------------------------------------------- |
| `lib/types.ts`               | model classes                                        |
| `lib/recipes.ts`             | a repository (data source)                           |
| `lib/actions.ts`             | backend endpoints / Cloud Functions you call directly |
| `app/**/page.tsx`            | screens — but rendered on the server                 |
| `components/*` with `'use client'` | interactive widgets                            |
| `app/layout.tsx`             | `MaterialApp` + shared `Scaffold`                    |

---

## Step 1 — Create the project

```bash
npx create-next-app@latest my-recipe-book --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --cache-components
cd my-recipe-book
npm install server-only
npm run dev
```

Clean up:
- delete the SVG files in `public/`
- we will replace `app/page.tsx`, `app/layout.tsx` and `app/globals.css`

Create folders at the project root: `lib/`, `components/`, `data/`.

Look at `next.config.ts`. `cacheComponents: true` turns on the Next.js 16 caching model
(`'use cache'`, Suspense-based streaming, Partial Prerendering). The `turbopack.rules` part lets
Turbopack (Next's bundler) process Tailwind.

📄 **`next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true, // the Next.js 16 caching model: 'use cache', Suspense, Partial Prerendering
  partialPrefetching: true,
  turbopack: {
    rules: {
      // lets Turbopack (Next.js's bundler) process Tailwind CSS
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
```

---

## Step 2 — The data: a JSON file as a tiny database

Create `data/recipes.json`. Copy the file from the finished project (it has 6 Sri Lankan recipes), or
start with this one recipe and add your own:

```json
[
  {
    "id": "pol-roti",
    "title": "Pol Roti",
    "description": "Soft coconut flatbread, perfect with lunu miris for breakfast.",
    "category": "breakfast",
    "minutes": 30,
    "servings": 4,
    "ingredients": ["2 cups wheat flour", "1 cup freshly grated coconut", "Salt to taste"],
    "steps": ["Mix everything with water into a dough.", "Flatten and cook on a hot pan."],
    "likes": 42,
    "createdAt": "2026-09-01T07:00:00.000Z"
  }
]
```

---

## Step 3 — Types shared by server and client (`lib/types.ts`)

📄 **`lib/types.ts`**

```ts
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
```

- `CATEGORIES ... as const` + `(typeof CATEGORIES)[number]` builds the union type
  `'breakfast' | 'main' | 'dessert' | 'drink'` **from** the array, so the list and the type never disagree.
- `isCategory` is a **type guard** (`value is Category`): after `if (isCategory(x))`, TypeScript knows `x`
  is a `Category`. Like Dart's `if (x is Category)`. We use it to check data that comes from forms and URLs.
- This file has **no server imports**, because client components (the form) import it too.

---

## Step 4 — The data layer (`lib/recipes.ts`)

📄 **`lib/recipes.ts`**

```ts
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
```

The most important ideas of the project are here:

- `import 'server-only'` — if any client component imports this file, the build fails. It protects
  server code (file system, later a database password) from leaking into the browser bundle.
- `node:fs/promises` — you're on the server, so you can read files. Impossible in a Vite app!
- `'use cache'` + `cacheLife('hours')` + `cacheTag('recipes')` on the **read** functions. Because the reads
  are cached, the home page and recipe pages can be **prerendered at build time**.
- The **write** functions (`addRecipe`, `likeRecipe`, `deleteRecipe`) are not cached. Only Server Actions call them.
- `searchRecipes` filters the cached list. It's called inside a `<Suspense>` boundary (Step 8),
  because the search text comes from the URL.

> In a real app you'd swap the JSON file for a database. Only this file would change.

---

## Step 5 — The Server Actions (`lib/actions.ts`)

📄 **`lib/actions.ts`**

```ts
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
```

- `'use server'` at the top: every exported function becomes a Server Action that the browser can call.
- `createRecipeAction(_prev, formData)` has the `useActionState` signature: previous state first.
- Form values arrive as strings in `FormData`. We **validate everything on the server** — never trust the client.
- Expected errors are **returned** (`{ errors, values }`), not thrown. `values` lets the form keep what
  the user typed.
- After writing: `updateTag('recipes')` expires every cached read with that tag, so the next render
  reads the new data. Then `redirect()` sends the user to the new recipe page.
- `likeRecipeAction` returns the new number of likes. `deleteRecipeAction` will be used with `.bind(null, id)`.

---

## Step 6 — Root layout and global CSS

### `app/globals.css`

📄 **`app/globals.css`**

```css
@import "tailwindcss";

/* Tailwind v4 theme: makes `font-sans` use the Geist font loaded in layout.tsx */
@theme inline {
  --font-sans: var(--font-geist-sans);
}

body {
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
```

### `app/layout.tsx`

📄 **`app/layout.tsx`**

```tsx
// ROOT LAYOUT: wraps every page (like MaterialApp + a shared Scaffold).
// It's a Server Component. It stays mounted while you navigate between pages.
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

// next/font downloads the font at BUILD time and serves it from your own site (no layout jump)
const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s · Recipe Book', // pages set their own title, e.g. "Pol Roti · Recipe Book"
    default: 'Recipe Book',
  },
  description: 'Sri Lankan recipes — a Next.js practice project for Flutter developers.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              🍲 Recipe Book
            </Link>
            <Link href="/recipes" className="text-stone-600 hover:text-orange-600 dark:text-stone-300">
              All recipes
            </Link>
            <Link
              href="/recipes/new"
              className="ml-auto rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              + New recipe
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500 dark:border-stone-800">
          Built with Next.js · data lives in <code>data/recipes.json</code> · API at{' '}
          <Link href="/api/recipes" className="underline">
            /api/recipes
          </Link>
        </footer>
      </body>
    </html>
  )
}
```

- The root layout must render `<html>` and `<body>`. It wraps every page and **stays mounted** during navigation.
- `metadata.title.template` → each page sets just its own part (`'All recipes'` → "All recipes · Recipe Book").
- `next/font/google` downloads Geist at build time and self-hosts it.
- Tailwind classes: `dark:` variants follow the system dark mode automatically.
- `LayoutProps<'/'>` is a type generated by Next.js — no import needed.

---

## Step 7 — A server-rendered card and the home page

### `components/RecipeCard.tsx`

📄 **`components/RecipeCard.tsx`**

```tsx
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
```

No `'use client'` and no hooks → it's rendered on the server and ships **zero JavaScript**. The whole card
is a `<Link>`, so clicking anywhere on it navigates (client-side, with prefetching).

### `app/page.tsx`

📄 **`app/page.tsx`**

```tsx
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
```

An `async` component that simply `await`s the data. **No `useEffect`, no loading state, no spinner.**
Since `getRecipes()` is cached, Next.js prerenders this page at build time — `○` in the build output.

✅ Check: open http://localhost:3000, then **View Page Source**: the recipe titles are in the HTML.

---

## Step 8 — Search page with streaming (`app/recipes/page.tsx`)

📄 **`app/recipes/page.tsx`**

```tsx
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
```

- `<Form action="/recipes">` from `next/form`: a GET form. Submitting navigates to
  `/recipes?q=...&category=...` **without a full page reload** (and still works with JS disabled).
  The input `name`s become the query keys.
- The page component is **not** async: the heading and the form are the **static shell**.
- `SearchResults` awaits `searchParams` (only known per request) **inside `<Suspense>`**. The fallback
  "Searching recipes…" is part of the shell, and the results **stream** in.
- `PageProps<'/recipes'>` and `Pick<..., 'searchParams'>` give correct types without writing them by hand.
- `typeof params.q === 'string'` — a search param could be `string | string[] | undefined`.

✅ Check: search "coconut". The URL changes. Copy the URL into a new tab: same results (state in the URL!).

---

## Step 9 — The recipe detail page (dynamic route)

### Client components used on this page

`components/LikeButton.tsx`:

📄 **`components/LikeButton.tsx`**

```tsx
'use client'
// A CLIENT component: it needs onClick and state, so its JS is sent to the browser.
// It calls a SERVER action (likeRecipeAction) — the browser sends a POST request for you.
import { useOptimistic, useTransition } from 'react'
import { likeRecipeAction } from '@/lib/actions'

export function LikeButton({ recipeId, likes }: { recipeId: string; likes: number }) {
  // useOptimistic: show +1 immediately, before the server answers (optimistic UI).
  // When the server re-renders the page with the real `likes`, this value follows it.
  const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, (current, added: number) => current + added)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      addOptimisticLike(1)
      await likeRecipeAction(recipeId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95 disabled:opacity-70 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
    >
      ❤️ {optimisticLikes} {optimisticLikes === 1 ? 'like' : 'likes'}
    </button>
  )
}
```

`components/DeleteRecipeButton.tsx`:

📄 **`components/DeleteRecipeButton.tsx`**

```tsx
'use client'
// A tiny client component: only the confirm() dialog needs the browser.
// The <form> that contains it (in the server page) calls the server action.
import { useFormStatus } from 'react-dom'

export function DeleteRecipeButton({ title }: { title: string }) {
  const { pending } = useFormStatus() // true while the parent form's action is running

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) e.preventDefault()
      }}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-red-950"
    >
      {pending ? 'Deleting…' : '🗑 Delete'}
    </button>
  )
}
```

### `app/recipes/[id]/page.tsx`

📄 **`app/recipes/[id]/page.tsx`**

```tsx
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
```

- The folder `[id]` makes a dynamic segment; `await props.params` gives `{ id }`.
- `generateStaticParams` → every existing recipe is **prerendered at build time** (SSG).
  New recipes are rendered on their first visit, then cached.
- `generateMetadata` → each recipe gets its own `<title>` and description (SEO, link previews).
- `notFound()` → shows the nearest `not-found.tsx`.
- **Server page + small client islands**: the page is a Server Component; only `LikeButton` and
  `DeleteRecipeButton` ship JS.
- `deleteRecipeAction.bind(null, recipe.id)` → a server action with the id already filled in, used as the
  `action` of a normal `<form>`. The client button only adds the `confirm()` dialog, and `useFormStatus`
  shows "Deleting…" while the parent form's action runs.
- `LikeButton`: `useOptimistic` shows +1 instantly; `startTransition` runs the server action; when the
  server re-renders with the real number, the optimistic value is replaced.

### `app/recipes/[id]/loading.tsx`

📄 **`app/recipes/[id]/loading.tsx`**

```tsx
// Shown instantly while app/recipes/[id]/page.tsx is rendering.
// Next.js wraps the page in <Suspense fallback={<Loading />}> for you.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-label="Loading recipe">
      <div className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="h-10 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="h-5 w-full rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-6 h-48 rounded-2xl bg-stone-200 dark:bg-stone-800" />
    </div>
  )
}
```

### `app/recipes/[id]/not-found.tsx`

📄 **`app/recipes/[id]/not-found.tsx`**

```tsx
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
```

✅ Check: open a recipe and click ❤️ several times — the count updates instantly, and `data/recipes.json`
changes on disk. Open `/recipes/does-not-exist` → the not-found page.

---

## Step 10 — Create recipes with a validated form

### `components/RecipeForm.tsx`

📄 **`components/RecipeForm.tsx`**

```tsx
'use client'
// A client component because it uses useActionState (to show errors and the pending state).
// The form still posts to a SERVER action — the validation and saving happen on the server.
import { useActionState } from 'react'
import { createRecipeAction, type RecipeFormState } from '@/lib/actions'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/types'

const initialState: RecipeFormState = {}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(createRecipeAction, initialState)
  const v = state.values ?? {}

  return (
    // After an action, React resets the form fields to their defaultValue.
    // So we use the values returned by the server as defaultValue → the user's input is kept on errors.
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="font-semibold">Title</label>
        <input id="title" name="title" defaultValue={v.title} className={inputClass} placeholder="e.g. Coconut Sambol" />
        <FieldError message={state.errors?.title} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="font-semibold">Short description</label>
        <textarea id="description" name="description" rows={2} defaultValue={v.description} className={inputClass} />
        <FieldError message={state.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="font-semibold">Category</label>
          <select id="category" name="category" defaultValue={v.category ?? ''} className={inputClass}>
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <FieldError message={state.errors?.category} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="minutes" className="font-semibold">Minutes</label>
          <input id="minutes" name="minutes" type="number" min={1} defaultValue={v.minutes} className={inputClass} />
          <FieldError message={state.errors?.minutes} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="servings" className="font-semibold">Servings</label>
          <input id="servings" name="servings" type="number" min={1} defaultValue={v.servings ?? '2'} className={inputClass} />
          <FieldError message={state.errors?.servings} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="ingredients" className="font-semibold">Ingredients <span className="font-normal text-stone-500">(one per line)</span></label>
        <textarea id="ingredients" name="ingredients" rows={5} defaultValue={v.ingredients} className={inputClass} />
        <FieldError message={state.errors?.ingredients} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="steps" className="font-semibold">Steps <span className="font-normal text-stone-500">(one per line)</span></label>
        <textarea id="steps" name="steps" rows={5} defaultValue={v.steps} className={inputClass} />
        <FieldError message={state.errors?.steps} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-orange-600 px-6 py-2.5 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save recipe'}
      </button>
    </form>
  )
}
```

### `app/recipes/new/page.tsx`

📄 **`app/recipes/new/page.tsx`**

```tsx
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
```

- The page is a Server Component (it exports `metadata`); the **form** is a Client Component because it
  uses `useActionState`.
- `useActionState(createRecipeAction, initialState)` gives `[state, formAction, pending]`.
  `state.errors` shows server validation messages; `pending` disables the button.
- `noValidate` turns off the browser's own validation so you can see the **server** validation working.
- Inputs use `defaultValue={v.title}` (uncontrolled) — after an error, React resets the form to these
  values, so nothing the user typed is lost.
- The folder `new` is static, so `/recipes/new` matches it before `[id]`.

✅ Check: submit the empty form → errors under each field. Fill it in correctly → you land on the new
recipe's page, and it appears on `/recipes` and in `data/recipes.json`.

---

## Step 11 — Error page and global 404

### `app/error.tsx`

📄 **`app/error.tsx`**

```tsx
'use client' // Error boundaries must be Client Components
// Catches unexpected errors thrown while rendering any page below app/ (like ErrorWidget.builder).
import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error) // in a real app: send to an error tracking service
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-6xl">😵</p>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-stone-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onClick={() => retry()} className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
        Try again
      </button>
    </div>
  )
}
```

### `app/not-found.tsx`

📄 **`app/not-found.tsx`**

```tsx
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
```

✅ Try it: temporarily add `throw new Error('Database is down!')` at the top of `getRecipes()` in
`lib/recipes.ts`. Reload the home page → the error page with "Try again". Remove the line, click
**Try again** → the page comes back. (In dev mode, Next.js also shows its error overlay first — close it.)

---

## Step 12 — A REST API for other clients (Route Handlers)

### `app/api/recipes/route.ts`

📄 **`app/api/recipes/route.ts`**

```ts
// ROUTE HANDLER  →  GET /api/recipes
// A normal JSON REST endpoint. Other apps can use it — for example YOUR FLUTTER APP:
//   final res = await http.get(Uri.parse('http://localhost:3000/api/recipes'));
import { getRecipes } from '@/lib/recipes'

export async function GET() {
  const recipes = await getRecipes()
  return Response.json(recipes)
}
```

### `app/api/recipes/[id]/route.ts`

📄 **`app/api/recipes/[id]/route.ts`**

```ts
// ROUTE HANDLER  →  GET /api/recipes/pol-roti
import type { NextRequest } from 'next/server'
import { getRecipe } from '@/lib/recipes'

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/recipes/[id]'>) {
  const { id } = await ctx.params
  const recipe = await getRecipe(id)

  if (!recipe) {
    return Response.json({ error: 'Recipe not found' }, { status: 404 })
  }
  return Response.json(recipe)
}
```

✅ Check: open http://localhost:3000/api/recipes in the browser → JSON.

### 🎯 Connect your Flutter app

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

// Android emulator: use 10.0.2.2 instead of localhost. iOS simulator: localhost works.
Future<List<dynamic>> fetchRecipes() async {
  final res = await http.get(Uri.parse('http://10.0.2.2:3000/api/recipes'));
  if (res.statusCode != 200) throw Exception('Failed: ${res.statusCode}');
  return jsonDecode(res.body) as List<dynamic>;
}
```

Your Next.js project is now **both a website and a backend for your mobile app**.

---

## Step 13 — Build and read the output

```bash
npm run lint
npm run build
npm start          # production server on http://localhost:3000
```

You should see something like:

```
Route (app)                 Revalidate  Expire
┌ ○ /                               1h      1d
├ ○ /api/recipes                    1h      1d
├ ƒ /api/recipes/[id]
├ ◐ /recipes
├   /recipes/[id]
│ ├ ◐ /recipes/[id]
│ ├ ○ /recipes/egg-hoppers          1h      1d
│ └ ◐ [+4 more paths]
└ ○ /recipes/new
```

Explain each line to yourself using lesson 04-nextjs/07. Then try the experiments from the lab again:
**View Page Source**, and **disable JavaScript** — the recipes still show, and even the search form works
(as a normal HTML form). The ❤️ button needs JavaScript, because it's a client component with `onClick`.

---

## Step 14 — Challenges

1. **Edit recipe** — add `/recipes/[id]/edit` with a form pre-filled from the recipe, and an
   `updateRecipeAction` (use `.bind(null, id)`).
2. **Category pages** — `/recipes/category/[category]` with `generateStaticParams` returning the 4 categories.
3. **Sort** — add `?sort=likes|newest|quickest` to the search page.
4. **Zod** — `npm i zod` and replace the manual validation in `createRecipeAction` with a schema.
5. **Images** — add an `image` URL field and show it with `next/image` (configure `images.remotePatterns`).
6. **Real database** — replace `data/recipes.json` with SQLite (`node:sqlite`), Supabase or Firebase.
   Only `lib/recipes.ts` should change.
7. **POST API** — add `POST /api/recipes` in the route handler so your Flutter app can create recipes too.
8. **Deploy** — push to GitHub and deploy on Vercel (after switching to a real database — see lesson 07).

🎉 When you finish this, you know React, React + Vite and Next.js well enough to build real projects.
Continue with [05-whats-next.md](../../05-whats-next.md).
