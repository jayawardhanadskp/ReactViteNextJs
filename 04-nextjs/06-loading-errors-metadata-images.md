# Next.js 06 — Loading, Errors, Not Found, Metadata (SEO), Images and Fonts

The "production polish" features. Each one is a special file or a built-in component.

## 1. `loading.tsx` — instant loading UI

```tsx
// app/recipes/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-2/3 rounded bg-stone-200" />
      <div className="h-4 w-full rounded bg-stone-200" />
    </div>
  )
}
```

A **skeleton** (grey boxes shaped like the content) feels faster than a spinner. Flutter: the
`shimmer` package.

## 2. `error.tsx` — catch unexpected errors

```tsx
// app/error.tsx
'use client'                                 // error boundaries are always Client Components
import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)                     // send to Sentry / your logging service
  }, [error])

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => retry()}>Try again</button>   {/* re-fetches and re-renders the segment */}
    </div>
  )
}
```

- If a Server Component **throws** while rendering (e.g. the database is down), the nearest `error.tsx`
  above it shows instead of the page. The layout around it keeps working (the navigation still works).
- Put `error.tsx` at different levels for different fallbacks (`app/error.tsx`, `app/dashboard/error.tsx`).
- `retry()` tries again. (Older Next.js versions used a `reset` prop — you'll see that in old tutorials.)
- Error boundaries **don't** catch errors in event handlers — use `try/catch` there (React core lesson 06).
- **Expected** errors (validation, "not found") should not throw: return them, or use `notFound()`.

`app/global-error.tsx` catches errors in the root layout itself (it must render its own `<html>` and `<body>`).

## 3. `notFound()` and `not-found.tsx`

```tsx
// app/recipes/[id]/page.tsx
import { notFound } from 'next/navigation'

const recipe = await getRecipe(id)
if (!recipe) notFound()            // stops rendering and shows the nearest not-found.tsx
```

```tsx
// app/recipes/[id]/not-found.tsx
import Link from 'next/link'
export default function RecipeNotFound() {
  return (
    <div>
      <h2>Recipe not found</h2>
      <Link href="/recipes">See all recipes</Link>
    </div>
  )
}
```

`app/not-found.tsx` is the global 404 page for URLs that match no route.

## 4. Metadata — titles, descriptions, link previews (SEO)

In a SPA you'd change `document.title` in an effect. In Next.js you **export** metadata from a
`layout.tsx` or `page.tsx` (server only), and Next.js puts it into the HTML `<head>`.

### Static metadata

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s · Recipe Book',    // child pages fill %s
    default: 'Recipe Book',
  },
  description: 'Sri Lankan recipes',
}
```

```tsx
// app/recipes/page.tsx
export const metadata: Metadata = { title: 'All recipes' }   // → "All recipes · Recipe Book"
```

### Dynamic metadata from data

```tsx
// app/recipes/[id]/page.tsx
export async function generateMetadata(props: PageProps<'/recipes/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const recipe = await getRecipe(id)          // cached → no double database work
  return {
    title: recipe?.title ?? 'Recipe not found',
    description: recipe?.description,
    openGraph: { title: recipe?.title, description: recipe?.description },  // WhatsApp/Facebook previews
  }
}
```

Open any page → **View Page Source** → see `<title>` and `<meta name="description">` already in the HTML.
That's why Google and link previews work with Next.js.

Other metadata files: `app/icon.png` (favicon), `app/opengraph-image.png` (preview image),
`app/sitemap.ts`, `app/robots.ts`.

## 5. Images: `next/image`

```tsx
import Image from 'next/image'
import hero from './hero.jpg'                  // local image file next to the page: size known automatically

<Image src={hero} alt="Kottu on a plate" priority />            {/* priority: above the fold */}

<Image
  src="https://images.example.com/kottu.jpg"   // remote image: give width & height
  alt="Kottu"
  width={800}
  height={500}
/>
```

What it does for you: resizes images for each screen size, converts to modern formats (WebP/AVIF),
lazy-loads images below the fold, and reserves space so the layout doesn't jump.
(Flutter comparison: `cached_network_image` + `cacheWidth` sizing.)

Remote images must be allowed in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.example.com' }],
  },
}
```

## 6. Fonts: `next/font`

```tsx
// app/layout.tsx
import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  )
}
```

The font is downloaded **at build time** and served from your own domain: no request to Google from the
user's browser (privacy), and no layout "jump" when the font loads. Flutter: `google_fonts` package, but
bundled at build time. Local font files: `next/font/local`.

## 7. Styling in Next.js

Everything from React core lesson 09 works:

- **Tailwind** — set up by `create-next-app` (`@import "tailwindcss"` in `app/globals.css`)
- **CSS Modules** — `Button.module.css` → `import styles from './Button.module.css'`
- **Global CSS** — import it in `app/layout.tsx`

CSS-in-JS libraries that need the browser at render time (some versions of styled-components/Emotion)
need extra setup with Server Components — prefer Tailwind or CSS Modules.

## Check yourself

1. Which special file shows a skeleton while a page loads?
2. Does `error.tsx` catch an error thrown inside an `onClick` handler?
3. How do you give each recipe page its own `<title>`?
4. Why use `next/image` instead of `<img>`?

<details><summary>Answers</summary>

1. `loading.tsx`.
2. No. Error boundaries catch rendering errors. Use `try/catch` in event handlers.
3. Export `generateMetadata` from the page and return `{ title: recipe.title }`.
4. Automatic resizing, modern formats, lazy loading and no layout shift.

</details>
