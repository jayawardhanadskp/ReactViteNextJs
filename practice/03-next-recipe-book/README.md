# Guided Project #2 — Recipe Book (Next.js)

👉 **Start with [TUTORIAL.md](TUTORIAL.md)** — it builds this app step by step.

This folder contains the **finished** app, so you can run it, compare, and peek when you're stuck.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build — read the route table it prints!
npm start          # run the production build
```

Uses: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4

```
app/
├── layout.tsx                    root layout: header, footer, fonts, metadata
├── page.tsx                      /                  (static, cached data)
├── error.tsx  not-found.tsx      error boundary + global 404
├── recipes/
│   ├── page.tsx                  /recipes           (static shell + streamed search results)
│   ├── new/page.tsx              /recipes/new       (form → Server Action)
│   └── [id]/
│       ├── page.tsx              /recipes/:id       (generateStaticParams, metadata, like, delete)
│       ├── loading.tsx           skeleton while loading
│       └── not-found.tsx         unknown recipe
└── api/recipes/
    ├── route.ts                  GET /api/recipes        (JSON — your Flutter app can call it)
    └── [id]/route.ts             GET /api/recipes/:id
components/                       RecipeCard (server) · LikeButton, RecipeForm, DeleteRecipeButton (client)
lib/
├── types.ts                      shared types + categories
├── recipes.ts                    data layer ('server-only', 'use cache', reads/writes data/recipes.json)
└── actions.ts                    Server Actions ('use server': create, like, delete)
data/recipes.json                 the "database"
```

> Creating, liking and deleting recipes changes `data/recipes.json`. To reset it, undo your changes
> to that file (or copy it again from the tutorial/original).
