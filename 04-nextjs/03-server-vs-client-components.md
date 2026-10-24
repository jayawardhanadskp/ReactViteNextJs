# Next.js 03 — Server Components vs Client Components

This is **the most important Next.js concept**. Most Next.js errors beginners see come from mixing these up.

## 1. The rule

- Every component in `app/` is a **Server Component** by default.
- Add `'use client'` at the **top of a file** to make the components in it **Client Components**.

```tsx
'use client'            // ← must be the very first line (before imports)

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 2. What each one can do

|                                              | Server Component        | Client Component (`'use client'`)   |
| -------------------------------------------- | ----------------------- | ----------------------------------- |
| Runs where                                   | server only             | server (pre-render to HTML) **and** browser |
| `async` / `await` in the component           | ✅                       | ❌                                   |
| Read DB, files, secret env vars              | ✅                       | ❌ (would leak secrets)              |
| `useState`, `useReducer`, `useEffect`        | ❌                       | ✅                                   |
| `onClick`, `onChange`, any event handler     | ❌                       | ✅                                   |
| Browser APIs (`window`, `localStorage`)      | ❌                       | ✅ (inside effects/handlers)         |
| Context (`useContext`)                       | ❌                       | ✅                                   |
| Its JS code is sent to the browser           | **No** (0 KB)           | Yes                                 |

Rule of thumb: **Server by default. Client only for the interactive leaves of the tree.**

## 3. The `'use client'` boundary

`'use client'` marks a **boundary**. That file **and everything it imports** become part of the client bundle.

```
app/recipes/[id]/page.tsx          (Server)  ← reads the recipe from the database
├── <h1>, ingredients, steps        (Server)  ← plain HTML, no JS shipped
├── <LikeButton />                  (Client)  ← 'use client': needs onClick + state
└── <form action={deleteAction}>    (Server)
    └── <DeleteRecipeButton />      (Client)  ← needs confirm() in the browser
```

Only `LikeButton` and `DeleteRecipeButton` ship JavaScript. The rest of the page is pure HTML.
This is how Next.js pages stay fast.

**Push `'use client'` down the tree.** Don't put it on a whole page just because one button needs a click.
Extract the button into its own client component.

```tsx
// ❌ Whole page becomes client: can't be async, can't read the DB, ships everything as JS
'use client'
export default function ProductPage() { ... }

// ✅ Page stays a server component; only the button is client
export default async function ProductPage(props: PageProps<'/products/[id]'>) {
  const product = await getProduct((await props.params).id)
  return (
    <>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} />   {/* 'use client' inside this file */}
    </>
  )
}
```

## 4. How they can be combined

### ✅ Server Component renders a Client Component (passing props)

Props must be **serializable** (they travel from server to browser as data):
strings, numbers, booleans, `null`, plain objects/arrays, `Date`, Promises, and **Server Actions**.

❌ Not allowed: normal functions (like `onClick={() => ...}` created in a server component),
class instances, Maps with functions...

```tsx
// Server component
<LikeButton recipeId={recipe.id} likes={recipe.likes} />          // ✅ strings/numbers
<LikeButton onLike={() => console.log('hi')} />                     // ❌ Error: functions can't be passed to Client Components
<RecipeForm action={createRecipeAction} />                          // ✅ Server Actions are allowed
```

### ❌ A Client Component cannot import a Server Component

Once you're inside a client file, everything you import is client code.

### ✅ But a Client Component can **receive** Server Components as `children`

```tsx
// components/Modal.tsx
'use client'
import { useState, type ReactNode } from 'react'

export function Collapsible({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <section>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && children}
    </section>
  )
}
```

```tsx
// app/page.tsx (Server)
<Collapsible title="Show reviews">
  <Reviews productId={id} />     {/* a SERVER component, rendered on the server, passed as a "slot" */}
</Collapsible>
```

Flutter comparison: the client widget gives you a `child` slot; the server fills it with ready-made UI.

### Context providers

Context needs `'use client'`. Create a client provider component and use it in the (server) layout:

```tsx
// app/providers.tsx
'use client'
import { ThemeProvider } from '@/lib/theme'
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

```tsx
// app/layout.tsx (Server)
<body><Providers>{children}</Providers></body>
```

The pages inside `children` can still be Server Components.

## 5. Keep server code on the server

### `import 'server-only'`

```ts
// lib/recipes.ts
import 'server-only'       // npm install server-only
import { readFile } from 'node:fs/promises'
```

If a Client Component ever imports this file (by mistake), the **build fails** with a clear error.
Use it for files with database access or secrets.

### Environment variables

```bash
# .env.local
DATABASE_URL=postgres://...            # server only (default)
STRIPE_SECRET_KEY=sk_live_...          # server only
NEXT_PUBLIC_MAPS_KEY=abc123            # NEXT_PUBLIC_ → also available in the browser
```

Like Vite's `VITE_` prefix: only `NEXT_PUBLIC_*` variables are put into browser code. Everything else
is only readable in server code (`process.env.DATABASE_URL`). Unlike Vite, **you can use secrets** —
in Server Components, Server Actions and Route Handlers.

## 6. Common errors and their fixes

| Error message (roughly)                                                       | Cause / Fix                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| "You're importing a component that needs `useState`. This React Hook only works in a Client Component" | add `'use client'` to that component's file                  |
| "Event handlers cannot be passed to Client Component props"                   | you wrote `onClick` in a server component → move the button into a client component |
| "async/await is not yet supported in Client Components"                       | don't make a `'use client'` component `async`. Fetch in a server parent and pass data as props |
| "window is not defined" / "localStorage is not defined"                       | client components also pre-render on the server. Use `window` only inside `useEffect` or event handlers |
| "Functions cannot be passed directly to Client Components"                    | only pass serializable props (or Server Actions)                           |
| Hydration mismatch warning                                                    | the server HTML and the first browser render differ (e.g. `Date.now()`, `Math.random()`, `localStorage` read during render). Read such values in `useEffect` |

## 7. Decision guide

```
Does this component need...
  state, effects, event handlers, browser APIs, context?  ──yes──▶  'use client'
                                                           ──no───▶  Server Component (default)
```

In the recipe project:

| Component            | Type   | Why                                             |
| -------------------- | ------ | ----------------------------------------------- |
| `app/layout.tsx`     | Server | static header/footer                            |
| `app/page.tsx`       | Server | reads recipes (cached)                          |
| `RecipeCard`         | Server | just displays data                              |
| `LikeButton`         | Client | `onClick`, `useOptimistic`, `useTransition`     |
| `RecipeForm`         | Client | `useActionState` (errors + pending state)       |
| `DeleteRecipeButton` | Client | `window.confirm`, `useFormStatus`               |
| `app/error.tsx`      | Client | error boundaries must be client components      |

## Check yourself

1. You add `onClick` to a `<button>` in `page.tsx` (no `'use client'`). What happens?
2. Can a Client Component be `async`?
3. How can a Client Component show a Server Component inside it?
4. Which env variables can browser code read?

<details><summary>Answers</summary>

1. Error: event handlers can't be used in Server Components. Move the button to a `'use client'` component.
2. No.
3. Receive it as `children` (or another prop) from a Server Component parent.
4. Only `NEXT_PUBLIC_*` ones.

</details>
