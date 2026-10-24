# Vite Explained — the tool behind "React with Vite"

> Flutter: `flutter create`, `flutter run` (with hot reload), `flutter build web`.
> Web: `npm create vite@latest`, `npm run dev` (with HMR), `npm run build`.

## 1. Create a project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

Templates: `react-ts` (React + TypeScript — use this), `react` (JS), `vanilla-ts`, `vue-ts`,
`svelte-ts`... Vite is **not** React-specific. The React support comes from a plugin.

## 2. Project anatomy, file by file

```
my-app/
├── index.html            ← the ONE html page (entry point). Not in public/ — at the root!
├── package.json          ← dependencies + scripts (pubspec.yaml)
├── package-lock.json     ← exact versions (pubspec.lock) — commit it
├── vite.config.ts        ← Vite configuration (plugins, aliases, server port...)
├── tsconfig.json         ← TypeScript config root (points to the two below)
├── tsconfig.app.json     ← TS settings for your app code in src/
├── tsconfig.node.json    ← TS settings for vite.config.ts (runs in Node, not browser)
├── .oxlintrc.json        ← linter rules (like analysis_options.yaml)
├── .gitignore
├── public/               ← files copied AS-IS to the output. Referenced by absolute path "/favicon.svg"
│   └── favicon.svg
├── src/                  ← your code (lib/ in Flutter)
│   ├── main.tsx          ← entry: mounts React into #root (main.dart)
│   ├── App.tsx           ← root component
│   ├── App.css
│   ├── index.css         ← global styles
│   └── assets/           ← images imported from code (processed + hashed by Vite)
└── node_modules/         ← installed packages (never edit, never commit)
```

### `index.html` — the real entry point

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-app</title>
  </head>
  <body>
    <div id="root"></div>                                  <!-- React renders inside this -->
    <script type="module" src="/src/main.tsx"></script>    <!-- Vite starts here -->
  </body>
</html>
```

The body is **empty** except `<div id="root">`. This is why a Vite React app is "client-side rendered":
the browser gets an empty page, then JS builds everything.

### `vite.config.ts`

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],     // adds JSX support + React Fast Refresh (hot reload that keeps state)
})
```

Common additions:

```ts
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },   // import x from '@/components/x'
  },
  server: {
    port: 3000,                                                  // dev server port
    proxy: { '/api': 'http://localhost:8080' },                  // forward /api to your backend (avoids CORS in dev)
  },
})
```

(For the `@` alias, also add `"paths": { "@/*": ["./src/*"] }` to `tsconfig.app.json` so TypeScript understands it.)

### `package.json` scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "preview": "vite preview"
}
```

| Script            | What it does                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `npm run dev`     | dev server on http://localhost:5173 with HMR                                |
| `npm run build`   | **type-check** (`tsc -b`) then bundle into `dist/`                          |
| `npm run preview` | serve the built `dist/` locally to test the production version              |
| `npm run lint`    | run the linter (oxlint — a very fast linter written in Rust)                |

> Important: `npm run dev` does **not** type-check (for speed). Type errors show in VS Code and
> fail `npm run build`. Run the build before you push.

## 3. How dev mode works (why it's fast)

Older tools (webpack) bundled your **whole app** before the dev server could start. Big apps took a
minute to start.

Vite in dev mode does **not** bundle. Modern browsers understand `import` natively (ES modules).
So Vite:

1. Serves `index.html`.
2. The browser requests `/src/main.tsx`. Vite **transforms only that file** (TSX → JS) and sends it.
3. The browser sees `import App from './App.tsx'` and requests that. Vite transforms it. And so on.
4. Packages from `node_modules` (React etc.) are **pre-bundled once** and cached.

Open DevTools → **Network** while `npm run dev` runs: you'll see each of your files loaded separately.

**HMR (Hot Module Replacement):** when you save `Button.tsx`, Vite sends only that module to the
browser through a WebSocket, and React Fast Refresh swaps the component **while keeping state**.
Exactly like Flutter hot reload. (Like Flutter, some changes need a full reload.)

## 4. How build mode works

`vite build` uses **Rolldown** (a very fast bundler written in Rust) to:

1. Bundle all modules into a few files (fewer requests).
2. Minify (remove spaces, shorten names).
3. **Tree-shake** (remove code you never import — like Flutter's tree shaking).
4. Add a **hash** to file names (`index-Cl6Bt99l.js`) so browsers can cache them forever; a new
   build = new name.
5. Split code into chunks when you use dynamic `import()` (lazy loading).

Output:

```
dist/
├── index.html                 (still almost empty, now pointing to the hashed JS/CSS)
├── favicon.svg                (copied from public/)
└── assets/
    ├── index-Cl6Bt99l.js      (~220 kB: React + your app; ~70 kB gzipped)
    └── index-D64VDMd1.css
```

`dist/` is **just static files**. You can host it anywhere that serves files.

## 5. Static assets: `public/` vs `src/assets/`

```tsx
// ① src/assets — imported in code. Vite processes it, hashes the name, may inline small files.
import logo from './assets/logo.png'
<img src={logo} alt="Logo" />

// ② public/ — NOT imported. Copied as-is. Use an absolute path.
<img src="/images/banner.jpg" alt="" />   // file: public/images/banner.jpg
```

Use `src/assets` for images used by components (you get errors if a file is missing).
Use `public/` for `robots.txt`, favicons, files that need an exact fixed URL.

## 6. Environment variables (`.env`)

```bash
# .env                 (shared)
# .env.local           (your machine only — gitignored)
# .env.production      (only for `vite build`)
VITE_API_URL=https://api.example.com
SECRET_KEY=abc        # ← NOT available in the browser (no VITE_ prefix)
```

```ts
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV        // true in npm run dev
const mode = import.meta.env.MODE        // 'development' | 'production'
```

> ⚠️ **Everything in a Vite app goes to the user's browser.** Any `VITE_` variable is visible to anyone
> who opens DevTools. **Never put secret keys (Stripe secret, DB password, OpenAI key) in a Vite app.**
> Secrets must live on a server. (This is one reason people use Next.js: it has a server.)
> Same rule as Flutter: anything compiled into the app can be extracted.

Type them (optional) in `src/vite-env.d.ts`:

```ts
interface ImportMetaEnv { readonly VITE_API_URL: string }
```

## 7. Lazy loading pages (code splitting)

```tsx
import { lazy, Suspense } from 'react'
const Settings = lazy(() => import('./pages/Settings'))     // separate JS file, loaded on demand

<Suspense fallback={<p>Loading…</p>}>
  <Settings />
</Suspense>
```

Flutter comparison: deferred imports (`import 'x.dart' deferred as x`).

## 8. Deploying a Vite app

```bash
npm run build      # creates dist/
```

Upload `dist/` to any static host:

| Host                 | How                                                            |
| -------------------- | -------------------------------------------------------------- |
| **Netlify / Vercel** | Connect the GitHub repo. Build command `npm run build`, output `dist`. |
| **Firebase Hosting** | `firebase init hosting` → public dir `dist`, "single-page app: yes" → `firebase deploy` (you know Firebase already!) |
| **GitHub Pages**     | Set `base: '/repo-name/'` in `vite.config.ts`, deploy `dist/`  |
| **Any server**       | Nginx/Apache serving the folder, with fallback to `index.html` |

Remember the SPA rule from the routing lesson: configure "all paths → `index.html`".

## 9. Vite vs other tools

| Tool               | Status                                                        |
| ------------------ | ------------------------------------------------------------- |
| Create React App   | **dead / deprecated.** Old tutorials use it. Don't use it.     |
| webpack            | older bundler, still in many existing company projects        |
| **Vite**           | the standard for React SPAs today                             |
| Turbopack          | Next.js's own bundler (you don't configure it directly)       |

## Check yourself

1. Why is Vite's dev server fast even for big apps?
2. Does `npm run dev` show TypeScript errors in the terminal?
3. You put `VITE_STRIPE_SECRET=sk_live_...` in `.env`. Is that safe?
4. What is inside `dist/` and where can you host it?

<details><summary>Answers</summary>

1. It doesn't bundle in dev. It transforms each file only when the browser asks for it, using native ES modules.
2. No. VS Code shows them, and `npm run build` (which runs `tsc -b`) fails on them.
3. No! `VITE_` variables are put into the browser bundle. Anyone can read them.
4. Static `index.html`, JS, CSS and assets. Any static host (Netlify, Vercel, Firebase Hosting, GitHub Pages, S3...).

</details>

👉 Now build **Guided project #1**: [../practice/02-vite-task-manager/TUTORIAL.md](../practice/02-vite-task-manager/TUTORIAL.md)
