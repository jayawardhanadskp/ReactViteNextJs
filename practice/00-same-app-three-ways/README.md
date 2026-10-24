# Lab 00 — The Same App, Three Ways (see the architecture with your own eyes)

This lab is the most important one for understanding **"what is the difference between React,
React + Vite, and Next.js?"**. You will run one tiny app — a **Quote Board** (3 quotes, each with a
❤️ like button) — built three different ways, and **inspect what the browser actually receives**.

Read [00-start-here/01-big-picture.md](../../00-start-here/01-big-picture.md) first.

| Folder            | How it's built                         | Rendering                    |
| ----------------- | -------------------------------------- | ---------------------------- |
| `1-plain-react/`  | React loaded from a CDN, no build tool | in the browser               |
| `2-react-vite/`   | React + TypeScript + Vite              | in the browser (CSR / SPA)   |
| `3-nextjs/`       | Next.js (React + server)               | on the server (SSG + PPR) + browser for the button |

---

## Part 1 — Plain React (React is "just a library")

```bash
cd practice/00-same-app-three-ways/1-plain-react
npx -y serve .          # a tiny static file server. Open the URL it prints (usually http://localhost:3000)
```

(You can also just double-click `index.html`, but some browsers block modules from `file://`.)

### Look at it

1. Open `index.html` in VS Code. There's **no `package.json`**, no `node_modules`, no build step.
   React is downloaded from a CDN (`esm.sh`) by the browser.
2. There's **no JSX**. Instead you see `h('p', null, 'text')`. That's `React.createElement` —
   **this is what JSX compiles to**. Writing UI like this is painful, which is why we use a build tool
   that understands JSX.
3. Click the ❤️ buttons — `useState` works exactly the same as anywhere else.

**Lesson:** React itself is only a JavaScript library. Everything else (JSX, TypeScript, imports from
npm, bundling, hot reload) is the job of a build tool.

---

## Part 2 — React + Vite (Client-Side Rendering)

```bash
cd ../2-react-vite
npm install
npm run dev             # http://localhost:5173
```

### Experiment A — View the page source

Right-click the page → **View Page Source** (or `Cmd + Option + U`). You'll see:

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

**The quotes are NOT in the HTML.** The server sent an empty page. Your browser downloaded JS,
React started, then `useEffect` fetched `/quotes.json`, then React drew the quotes.

### Experiment B — Watch the network

DevTools → **Network** tab → reload. You'll see many requests: `main.tsx`, `App.tsx`, `Quote.tsx`
(Vite serves each file separately in dev mode), React, and finally `quotes.json` — requested
**by the browser**.

### Experiment C — Disable JavaScript

DevTools → `Cmd + Shift + P` → type **"Disable JavaScript"** → Enter → reload.
**The page is blank.** No JS = no React = no UI. (Turn JS back on afterwards: same command, "Enable JavaScript".)

### Experiment D — Production build

```bash
npm run build
cat dist/index.html     # still an empty <div id="root">, now pointing to one bundled JS file
ls dist/assets          # one JS file (~220 kB, ~70 kB gzipped) + one CSS file
npm run preview         # serve the production build
```

**Lesson:** a Vite app is a bundle of static files. The browser does all the rendering. Exactly like a
Flutter web app.

---

## Part 3 — Next.js (Server Rendering)

```bash
cd ../3-nextjs
npm install
npm run dev             # http://localhost:3000
```

### Experiment A — View the page source

**View Page Source** again. Search (`Cmd + F`) for **"Everything is a widget"**.
**It's there, in the HTML!** The server already rendered the quotes. The browser shows them
immediately, before any JavaScript runs.

### Experiment B — Where does the code run?

Open `app/page.tsx`. It has `console.log('Rendering the quote list on the server')`.

- Look at the **browser console** → the message is **not** there.
- Look at the **terminal** where `npm run dev` is running → **the message is there.**

`page.tsx` is a **Server Component**. It ran on the server (Node.js). It even reads the JSON file
directly with `import` — no `fetch`, no `useEffect`, no loading spinner.

Now open `app/like-button.tsx`. It starts with `'use client'`. That marks a **Client Component**:
its JS is sent to the browser so it can use `useState` and `onClick`.

### Experiment C — Disable JavaScript

Disable JavaScript again and reload. **The quotes are still visible!** (The ❤️ buttons don't work,
because they need JS.) This is why Next.js is great for SEO and slow devices.

### Experiment D — Production build: static + dynamic

```bash
npm run build
```

Look at the output at the end:

```
Route (app)
┌ ◐ /
└ ○ /_not-found

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

- The quotes were rendered **once, at build time** (you'll see the console.log in the build output!).
  That's **SSG** — the HTML is ready before any user visits.
- The "rendered on the server at …" line is inside `<Suspense>` and uses `await connection()`,
  so it's rendered **on every request** and **streamed** into the page. That's the dynamic part.
  Static shell + dynamic holes = **Partial Prerendering (PPR)**.

```bash
npm start               # run the production server; reload a few times and watch the time change
```

**Lesson:** Next.js runs React on a **server** too. You decide which parts are static, which are
dynamic, and which small parts are interactive in the browser.

---

## Summary table — fill it in yourself

| Question                                      | Plain React | React + Vite | Next.js |
| --------------------------------------------- | ----------- | ------------ | ------- |
| Are the quotes in "View Page Source"?         |             |              |         |
| Does the page show quotes with JS disabled?   |             |              |         |
| Where does `console.log` in the page appear?  |             |              |         |
| Is there a build step?                        |             |              |         |
| Can you host it on a static host (no server)? |             |              |         |

<details>
<summary>Answers</summary>

| Question                                      | Plain React | React + Vite | Next.js |
| --------------------------------------------- | ----------- | ------------ | ------- |
| Are the quotes in "View Page Source"?         | No          | No           | **Yes** |
| Does the page show quotes with JS disabled?   | No          | No           | **Yes** |
| Where does `console.log` in the page appear?  | Browser     | Browser      | **Terminal (server)** |
| Is there a build step?                        | No          | Yes (Vite)   | Yes (Next/Turbopack) |
| Can you host it on a static host (no server)? | Yes         | Yes          | Only parts that are fully static (needs a server for dynamic parts) |

</details>
