# Next.js 07 — Building, Deploying, and Choosing Between Vite and Next.js

## 1. Build and run in production

```bash
npm run build      # next build: compiles, type-checks, prerenders static pages
npm start          # next start: runs the production Node.js server on port 3000
```

Read the build output — it tells you how each route is rendered:

```
Route (app)                 Revalidate  Expire
┌ ○ /                               1h      1d      ← static (prerendered), refreshed hourly
├ ◐ /recipes                                        ← static shell + streamed dynamic part
├   /recipes/[id]
│ ├ ○ /recipes/egg-hoppers          1h      1d      ← prerendered via generateStaticParams
│ └ ◐ [+4 more paths]
├ ƒ /api/recipes/[id]                               ← dynamic: runs on every request
└ ○ /recipes/new

○ Static   ◐ Partial Prerender   ƒ Dynamic
```

If a page you expected to be static shows `ƒ`, something in it reads request data (cookies, headers,
search params) or uncached data.

The output goes into the `.next/` folder (don't commit it).

## 2. Where to deploy

| Option                        | How                                                                 | Notes                                         |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| **Vercel** (made by the Next.js team) | Push to GitHub → import the repo on vercel.com → done       | Easiest. Free hobby tier. Everything just works |
| **Netlify, Cloudflare, AWS Amplify, Firebase App Hosting** | Connect the repo; they detect Next.js | Most features supported                       |
| **Your own server / VPS**     | `npm ci && npm run build && npm start` (use pm2 or systemd)          | Full control                                  |
| **Docker**                    | Set `output: 'standalone'` in `next.config.ts` → small image with `node server.js` | Cloud Run, Kubernetes, Railway, Fly.io |
| **Static export**             | `output: 'export'` → plain HTML/CSS/JS in `out/`                    | No server features (no Server Actions, no dynamic rendering, no `cookies()`) |

Environment variables: set them in the hosting dashboard (never commit `.env.local`).

### ⚠️ About our recipe project's JSON file

`practice/03-next-recipe-book` saves data into `data/recipes.json`. That works on your computer and on a
normal server, but **serverless platforms (like Vercel) have a read-only file system**, and each
request may run on a different machine. Real apps store data in a **database**:
Postgres (Neon, Supabase), MySQL (PlanetScale), MongoDB Atlas, or Firebase Firestore. Only `lib/recipes.ts`
would change — that's the point of keeping data access in one file.

## 3. Production checklist (short)

- [ ] `npm run build` passes with no errors, `npm run lint` is clean
- [ ] Every page has a meaningful `title` and `description`
- [ ] Images use `next/image` with good `alt` text
- [ ] Secrets are only in server code (no `NEXT_PUBLIC_` on secrets)
- [ ] Every Server Action validates input and checks auth
- [ ] `error.tsx` and `not-found.tsx` exist and look good
- [ ] Slow data is inside `<Suspense>` / `loading.tsx` with a skeleton

## 4. Vite vs Next.js — the final decision guide

### Pick **React + Vite** when…

- it's an **app behind a login** (admin panel, dashboard, internal tool) and SEO doesn't matter
- you **already have a backend** (Firebase, Supabase, Spring, Laravel, Django, Node API)
- you want the **simplest mental model**: everything runs in the browser, like Flutter
- you want **cheap/free static hosting** (Netlify, GitHub Pages, Firebase Hosting)
- it's a **widget embedded** into another site, or a desktop app (Electron/Tauri)

### Pick **Next.js** when…

- it's a **public website**: marketing, blog, e-commerce, docs — it must be **fast on first load and found on Google**
- link previews (WhatsApp, Facebook, LinkedIn) must show real titles and images
- you want **frontend + backend in one project** (Server Actions, Route Handlers, DB access)
- you need **secrets** (payment keys, AI API keys) used safely on the server
- a mix of static and dynamic pages (most content cached, some personalised)

### Side by side

|                         | React + Vite (SPA)                     | Next.js (App Router)                              |
| ----------------------- | -------------------------------------- | ------------------------------------------------- |
| Where React runs        | browser                                | server + browser                                  |
| First HTML              | empty `<div id="root">`                | full content                                      |
| Data loading            | `useEffect` / TanStack Query in browser | `async` Server Components, `'use cache'`         |
| Mutations               | `fetch` to your API                    | Server Actions                                    |
| Routing                 | React Router (code)                    | file system (`app/` folders)                      |
| Backend                 | separate project                       | built in (or call an external one)                |
| Secrets                 | ❌ never in the app                     | ✅ in server code                                  |
| Hosting                 | any static host                        | Node server / Vercel / Docker (or static export)  |
| Learning curve          | lower                                  | higher (server vs client, caching)                |
| Flutter feeling         | very similar to a Flutter app          | Flutter app + Dart backend in one project         |

### What about React Native?

Since you're a mobile developer: **React Native** (usually with **Expo**) uses the same React you just
learned — components, props, state, hooks, context — but renders native mobile views (`<View>`, `<Text>`)
instead of HTML. Your React knowledge transfers directly. It's the main competitor of Flutter.

## 5. Interview-style questions (test yourself)

1. What's the difference between React, Vite and Next.js?
2. What is CSR, SSR, SSG? Which does a Vite app use?
3. What is hydration?
4. What are React Server Components? What can't they do?
5. When do you need `'use client'`?
6. How do you fetch data in the Next.js App Router? How do you cache it?
7. What is a Server Action? What security rule must you follow?
8. Why is the `key` prop important in lists?
9. Why must React state be updated immutably?
10. When should you NOT use `useEffect`?

<details><summary>Short answers</summary>

1. React = UI library. Vite = build tool/dev server (bundles your code, HMR). Next.js = full-stack React framework (routing, server rendering, caching, server code; uses Turbopack, not Vite).
2. CSR = rendered in the browser; SSR = rendered on the server per request; SSG = rendered at build time. A Vite SPA uses CSR.
3. React attaching event handlers/state to server-rendered HTML so it becomes interactive.
4. Components that run only on the server, can be async and access server resources; their code isn't sent to the browser. They can't use state, effects, event handlers or browser APIs.
5. When a component needs state, effects, event handlers, browser APIs or context.
6. `await` data in async Server Components. Cache with `'use cache'` + `cacheLife` (+ `cacheTag` for on-demand expiry); stream dynamic parts with `<Suspense>`.
7. A `'use server'` function callable from the client (forms/buttons) that runs on the server. Always validate input and check auth inside it — it's a public endpoint.
8. It lets React match items between renders, so state stays with the right item when the list changes.
9. React compares references (`===`). Mutating keeps the same reference, so React doesn't see a change.
10. For values you can calculate during render, and for logic that should run in response to a user event (put it in the handler).

</details>

👉 Now build **Guided project #2**: [../practice/03-next-recipe-book/TUTORIAL.md](../practice/03-next-recipe-book/TUTORIAL.md)
