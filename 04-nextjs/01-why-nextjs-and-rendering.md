# Next.js 01 — Why Next.js? How rendering works

> You know React now. Next.js = **React + a server + a router + a build system + caching**.
> Everything you learned (components, props, state, hooks) still works. Next.js adds **where** and
> **when** your components run.

## 1. The problems with a pure SPA (React + Vite)

You saw these in the lab `practice/00-same-app-three-ways`:

| Problem                         | Why it happens in a SPA                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| Blank page at first             | HTML is empty until the JS bundle downloads and runs               |
| Weak SEO / link previews        | Google bots and WhatsApp previews see `<div id="root"></div>`      |
| Big JS bundle                   | **All** components go to the browser, even static text             |
| Loading spinners everywhere     | Data is fetched **after** the page loads (`useEffect` → spinner)   |
| Request waterfalls              | Load JS → render → fetch user → render → fetch posts → render…     |
| Secrets can't be used           | Everything runs in the browser — API keys would be public          |
| Need a separate backend         | Another project, another language, another deployment             |

Next.js fixes these by running React components **on the server** too.

## 2. Server Components — the key idea

In Next.js (App Router), **every component is a Server Component by default**.

A Server Component:
- runs **only on the server** (at build time, or when a request comes in)
- can be `async` and `await` data **directly** — a database, a file, a secret API
- sends **HTML** (and a compact description of the UI) to the browser — **not its JavaScript code**
- **cannot** use `useState`, `useEffect`, `onClick` (it's not in the browser!)

```tsx
// app/page.tsx — a Server Component
export default async function Page() {
  const res = await fetch('https://api.example.com/products', {
    headers: { Authorization: `Bearer ${process.env.SECRET_API_KEY}` },   // secret stays on the server ✅
  })
  const products: Product[] = await res.json()

  return (
    <ul>
      {products.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

No `useState`, no `useEffect`, no loading state. The data is **already there** when the HTML arrives.

When you need interactivity, you mark a component with `'use client'` → a **Client Component**
(a normal React component like in Vite, which also gets pre-rendered to HTML on the server).
Lesson 03 covers this in depth.

Flutter comparison: imagine if some of your widgets could run **on your backend server**, read the
database directly, and send only the finished pixels to the phone, while the buttons still ran on the phone.

## 3. What happens on a request (step by step)

```
User opens /recipes/pol-roti
        │
        ▼
┌──────────────────────── Next.js server ───────────────────────────────┐
│ 1. Router matches the URL to app/recipes/[id]/page.tsx                │
│ 2. Renders the layouts + page (Server Components run, data is read)   │
│    — or uses a cached copy prepared at build time                      │
│ 3. Produces:  a) HTML  (for the first paint)                          │
│               b) RSC payload (a compact description of the tree,      │
│                  with "holes" where Client Components go)              │
└───────────────────────────────────────────────────────────────────────┘
        │  HTML streams to the browser
        ▼
Browser:
 4. Shows the HTML immediately  → user can read the recipe (even if JS is slow/disabled)
 5. Downloads JS only for Client Components (e.g. the ❤️ LikeButton)
 6. HYDRATION: React attaches event handlers and state to that existing HTML
 7. Now the button is interactive
 8. User clicks a <Link> → Next fetches only the RSC payload for the new page
    and swaps it in, WITHOUT a full reload (feels like a SPA). Layouts keep their state.
```

**Hydration** = "bringing static HTML to life". The HTML is like a photo of your UI; hydration connects
the real React components to it so clicks work.

## 4. Static vs Dynamic — WHEN does rendering happen?

Next.js tries to do as much work as possible **at build time**, so pages can be served instantly from a
CDN (like serving a static file).

| Kind of content                          | When it's rendered          | Example                               |
| ---------------------------------------- | --------------------------- | ------------------------------------- |
| No data, or data that can be **cached**  | **At build time** (static)  | home page, blog posts, product pages  |
| Data that depends on the **request**     | **On each request** (dynamic) | search results (`?q=`), user's cart (cookies), "now" |

In **Next.js 16** with **Cache Components** (on by default in new apps), you control this per component:

```tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

export default function Page() {
  return (
    <>
      <h1>Shop</h1>                              {/* static: part of the prerendered shell */}
      <Products />                               {/* cached with 'use cache': also in the static shell */}
      <Suspense fallback={<p>Loading cart…</p>}> {/* fallback is in the shell…              */}
        <Cart />                                 {/* …the real cart streams in on each request */}
      </Suspense>
    </>
  )
}

async function Products() {
  'use cache'                 // cache this component's result
  cacheLife('hours')          // refresh it at most every hour
  const products = await db.products.findMany()
  return <ProductGrid products={products} />
}

async function Cart() {
  const cartId = (await cookies()).get('cart')?.value   // depends on the user → dynamic
  const cart = await getCart(cartId)
  return <CartSummary cart={cart} />
}
```

The result is **Partial Prerendering (PPR)**: a **static shell** served instantly + **dynamic holes**
streamed in. (Remember the restaurant analogy from the big-picture lesson: the plate and rice are ready;
the hot curry comes a moment later.)

You'll see the result after `npm run build`:

```
Route (app)
┌ ○ /                      ← ○ Static: fully prerendered
├ ◐ /recipes               ← ◐ Partial Prerender: static shell + streamed dynamic parts
└ ƒ /api/recipes/[id]      ← ƒ Dynamic: rendered on every request
```

Lesson 04 explains `'use cache'`, `cacheLife`, `Suspense` and streaming in detail.

## 5. Create a Next.js app

```bash
npx create-next-app@latest my-next-app
```

It asks some questions (the exact wording changes between versions; if it offers "recommended
defaults", choose to customize). Good answers for learning:

```
✔ TypeScript?             Yes
✔ Linter?                 ESLint
✔ React Compiler?         No   (you can try it later)
✔ Tailwind CSS?           Yes
✔ src/ directory?         No   (this course uses app/ at the root)
✔ App Router?             Yes  ← always (Pages Router is the old way)
✔ Import alias?           @/*
```

Or all at once:

```bash
npx create-next-app@latest my-next-app --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

```bash
cd my-next-app
npm run dev        # http://localhost:3000
```

## 6. App Router vs Pages Router (don't get confused by old tutorials)

Next.js has two routers:

| | **App Router** (`app/` folder) | Pages Router (`pages/` folder) |
| --- | --- | --- |
| Since | 2023 (Next 13+) | 2016 |
| Status | **Current, recommended** | Old, still supported |
| Data fetching | `async` Server Components, Server Actions | `getServerSideProps`, `getStaticProps` |
| Layouts | `layout.tsx` (nested) | `_app.tsx` |

**This course uses only the App Router.** If a tutorial mentions `getServerSideProps` or `pages/_app.tsx`,
it's the old Pages Router.

## 7. The mental model in one picture

```
           ┌─────────────────────────── YOUR NEXT.JS PROJECT ───────────────────────────┐
           │                                                                            │
 SERVER    │  layout.tsx, page.tsx  (Server Components: async, read DB/files/secrets)   │
 (Node.js) │  lib/actions.ts        ('use server' — Server Actions: save data)          │
           │  app/api/**/route.ts   (Route Handlers: REST API for other clients)        │
           │                                                                            │
 ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ 'use client' boundary ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
           │                                                                            │
 BROWSER   │  LikeButton.tsx, RecipeForm.tsx  (Client Components: useState, onClick)     │
           │  (also pre-rendered to HTML on the server, then hydrated)                  │
           └────────────────────────────────────────────────────────────────────────────┘
```

## Check yourself

1. In the App Router, are components server or client by default?
2. Can a Server Component use `useState`? Can it read a database?
3. What is hydration?
4. What does ◐ mean in the build output?

<details><summary>Answers</summary>

1. Server.
2. No `useState` (no interactivity on the server). Yes, it can read a database directly.
3. React attaching state and event handlers to HTML that was already rendered on the server.
4. Partial Prerender: a static HTML shell prerendered at build time, with dynamic parts streamed at request time.

</details>
