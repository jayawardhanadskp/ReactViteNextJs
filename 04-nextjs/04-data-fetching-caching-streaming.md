# Next.js 04 — Data Fetching, Caching and Streaming

> Flutter: repository → `FutureBuilder` → loading/error/data, maybe a cache.
> Next.js: an `async` Server Component **awaits** the data. `<Suspense>` shows loading. `'use cache'` caches.

This lesson uses the **Next.js 16 "Cache Components" model** (enabled by `cacheComponents: true` in
`next.config.ts`, the default for new apps). Older tutorials talk about `export const revalidate`,
`fetch(..., { cache: 'force-cache' })` and `dynamic = 'force-dynamic'` — that's the previous model.

## 1. Fetching in a Server Component

```tsx
// app/users/page.tsx
type User = { id: number; name: string }

export default async function UsersPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  if (!res.ok) throw new Error('Could not load users')     // caught by error.tsx
  const users: User[] = await res.json()

  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
}
```

Compare with lesson 06 of React core (`useEffect` + 3 states + abort controller). Here: **no hooks, no
loading state, no race conditions**. The page is sent when the data is ready.

You can also read a database, a file, or call any server-side SDK directly:

```tsx
import { db } from '@/lib/db'
export default async function Page() {
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } })
  // ...
}
```

### Organise data access in `lib/` (a repository)

```ts
// lib/recipes.ts
import 'server-only'
export async function getRecipes(): Promise<Recipe[]> { /* read DB/file/API */ }
export async function getRecipe(id: string): Promise<Recipe | null> { /* ... */ }
```

Pages call these functions. If you later switch from a JSON file to Postgres, only `lib/` changes —
exactly like swapping a repository implementation in Flutter.

## 2. Parallel vs sequential fetching

```tsx
// ❌ Sequential: the second request waits for the first (slow "waterfall")
const user = await getUser(id)
const posts = await getPosts(id)

// ✅ Parallel: both start at the same time (Dart: Future.wait)
const [user, posts] = await Promise.all([getUser(id), getPosts(id)])
```

## 3. Caching with `'use cache'`

By default, data reads are **not cached**: they run on every request. If the data doesn't change on every
request, cache it:

```ts
// lib/recipes.ts
import { cacheLife, cacheTag } from 'next/cache'

export async function getRecipes(): Promise<Recipe[]> {
  'use cache'                 // ← cache the return value of this function
  cacheLife('hours')          // ← how long it stays fresh
  cacheTag('recipes')         // ← a name, so we can expire it after a change

  const json = await readFile(DATA_FILE, 'utf-8')
  return JSON.parse(json)
}
```

- The **arguments** are part of the cache key: `getRecipe('a')` and `getRecipe('b')` are cached separately.
- `'use cache'` can be on a **function** (data-level) or on a **component** (UI-level):

```tsx
async function PopularProducts() {
  'use cache'
  cacheLife('days')
  const products = await db.product.findMany({ take: 10, orderBy: { sales: 'desc' } })
  return <ProductGrid products={products} />
}
```

`cacheLife` profiles:

| Profile   | Refresh in background after | Expires after |
| --------- | --------------------------- | ------------- |
| `seconds` | 1 s                         | 1 min         |
| `minutes` | 1 min                       | 1 hour        |
| `hours`   | 1 hour                      | 1 day         |
| `days`    | 1 day                       | 1 week        |
| `weeks`   | 1 week                      | 30 days       |
| `max`     | 30 days                     | 1 year        |

**Why caching matters:** a page whose data is all cached can be **prerendered at build time** — served as
static HTML from a CDN, super fast, like a static website. That's how `/` in the recipe project is `○ Static`.

### Expiring the cache after a change

After you save data (in a Server Action — next lesson), tell Next.js the cached data is old:

```ts
import { updateTag } from 'next/cache'
updateTag('recipes')      // every cached function tagged 'recipes' runs again on the next request
```

## 4. Dynamic data and `<Suspense>` streaming

Some data **can't** be prepared at build time:
- **runtime APIs**: `cookies()`, `headers()`, `searchParams`, and `params` that weren't known at build time
- data that must be **fresh on every request** (stock prices, "who is online")

With Cache Components, Next.js asks you to put such components inside `<Suspense>`:

```tsx
import { Suspense } from 'react'

export default function RecipesPage(props: PageProps<'/recipes'>) {
  return (
    <>
      <h1>All recipes</h1>                              {/* static shell */}
      <SearchForm />                                    {/* static shell */}
      <Suspense fallback={<p>Searching…</p>}>           {/* fallback is in the static shell */}
        <SearchResults searchParams={props.searchParams} />   {/* streamed per request */}
      </Suspense>
    </>
  )
}

async function SearchResults({ searchParams }: Pick<PageProps<'/recipes'>, 'searchParams'>) {
  const { q } = await searchParams                      // depends on the URL → request time
  const recipes = await searchRecipes(typeof q === 'string' ? q : '')
  return <RecipeGrid recipes={recipes} />
}
```

What the user experiences:

```
t=0ms    HTML arrives: heading + search form + "Searching…"      ← instantly, from the static shell
t=80ms   the results HTML streams into the SAME response, replacing "Searching…"
```

This is **streaming**: the server sends the page in chunks over one HTTP response.
`<Suspense>` = Flutter `FutureBuilder`, but on the server, and without you managing state.

> If you read runtime data **outside** a Suspense boundary, the dev overlay shows a
> "blocking route" message telling you to wrap it in `<Suspense>` or cache it. Follow its advice.

### Need a fresh value on every request?

```tsx
import { connection } from 'next/server'

async function ServerTime() {
  await connection()                      // "this needs a real request" → not prerendered
  return <p>Server time: {new Date().toLocaleTimeString()}</p>
}

// used inside <Suspense fallback={...}><ServerTime /></Suspense>
```

You saw exactly this in the lab `practice/00-same-app-three-ways/3-nextjs`.

## 5. `loading.tsx` — a Suspense boundary for a whole page

```tsx
// app/recipes/[id]/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading recipe…</div>
}
```

Next.js wraps `page.tsx` in `<Suspense fallback={<Loading />}>`. When the user clicks a link to that
route, the loading UI appears **immediately** and the page replaces it when ready.
Use `loading.tsx` for whole pages, and `<Suspense>` for smaller parts.

## 6. Dynamic routes at build time: `generateStaticParams`

```tsx
// app/recipes/[id]/page.tsx
export async function generateStaticParams() {
  const recipes = await getRecipes()
  return recipes.map((r) => ({ id: r.id }))     // → prerender /recipes/pol-roti, /recipes/faluda, ...
}
```

All known recipes become static HTML at build time (**SSG**). A recipe created **after** the build is
rendered on its first visit and then cached (**ISR** — incremental static regeneration).

## 7. Fetching in Client Components (when you need it)

Sometimes data must be loaded in the browser (infinite scroll, polling, data that depends on client
state). Options:

1. **Pass a Promise from server to client and read it with `use()`**:

```tsx
// Server
export default function Page() {
  const postsPromise = getPosts()               // don't await
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Posts posts={postsPromise} />
    </Suspense>
  )
}

// Client
'use client'
import { use } from 'react'
export function Posts({ posts }: { posts: Promise<Post[]> }) {
  const list = use(posts)                       // suspends until resolved
  return <ul>{list.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
}
```

2. **TanStack Query / SWR** — the same libraries you'd use in a Vite app.
3. `useEffect` + `fetch` — works, but you now know better options.

## 8. Summary: which tool for which data?

| Data                                              | Tool                                                  |
| ------------------------------------------------- | ----------------------------------------------------- |
| Same for everyone, changes rarely (blog, products)| `'use cache'` + `cacheLife` + `cacheTag`              |
| Depends on URL search params / cookies / headers  | read it inside `<Suspense>`                           |
| Must be fresh every request                       | `await connection()` inside `<Suspense>`              |
| Known list of pages                               | `generateStaticParams`                                |
| Changes after a user action                       | Server Action + `updateTag` (next lesson)             |
| Live in the browser (polling, infinite scroll)    | client component + TanStack Query / SWR / `use()`     |

## Check yourself

1. How do you load data in a Server Component?
2. What does `cacheTag('recipes')` let you do later?
3. Why must a component that reads `searchParams` be inside `<Suspense>` (with Cache Components)?
4. What does `loading.tsx` do?

<details><summary>Answers</summary>

1. Make the component `async` and `await` the data (fetch, DB, file).
2. Expire that cached data on demand with `updateTag('recipes')` (or `revalidateTag`) after a change.
3. Search params are only known at request time, so that part can't be in the static shell. Suspense gives a fallback for the shell and streams the real content.
4. It's an automatic `<Suspense>` fallback for the page in that folder, shown instantly during navigation.

</details>
