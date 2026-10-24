# 01 — The Big Picture: React vs Vite vs Next.js (and how they fit together)

> Goal of this lesson: after reading, you can explain to another developer what React, Vite and
> Next.js are, how they are different, and what happens inside the browser and server for each.

---

## 1. First, how does a web page even work?

In Flutter, your Dart code is compiled and the **Flutter engine** paints every pixel itself.

On the web, the **browser** is the engine. The browser understands only **three languages**:

| Language       | Job                               | Flutter comparison                                 |
| -------------- | --------------------------------- | -------------------------------------------------- |
| **HTML**       | The structure (what is on screen) | The widget tree (`Column`, `Text`, `Image` ...)    |
| **CSS**        | The look (colors, sizes, layout)  | Widget properties like `padding`, `color`, `style` |
| **JavaScript** | The behaviour (logic, clicks)     | Your Dart code (`onPressed`, `setState`)           |

When you open a website:

```
 You type example.com
        │
        ▼
 ┌──────────────┐   1. asks for the page    ┌──────────────┐
 │   Browser    │ ────────────────────────▶ │   Server     │
 │ (Chrome etc) │ ◀──────────────────────── │              │
 └──────────────┘   2. sends back HTML,      └──────────────┘
        │              CSS and JS files
        ▼
 3. Browser reads HTML → builds the "DOM" (a tree of elements, like a widget tree)
 4. Browser applies CSS → paints pixels
 5. Browser runs JS     → JS can change the DOM (add/remove/update elements) when the user clicks
```

### The DOM = the browser's widget tree

The **DOM** (Document Object Model) is a tree of elements that the browser keeps in memory:

```
HTML                                    Flutter mental model
<body>                                  Scaffold(
  <h1>Hello</h1>                          body: Column(children: [
  <button>Click</button>                    Text('Hello'),
</body>                                     ElevatedButton(child: Text('Click')),
                                          ]))
```

Before React existed, developers changed the DOM by hand with JavaScript:

```js
// "Imperative" style — you tell the browser every step
const h1 = document.querySelector('h1')
h1.textContent = 'Count: ' + count
if (count > 5) h1.style.color = 'red'
```

This becomes a mess in big apps. You must remember to update every element whenever data changes.
Flutter solved this problem with **declarative UI**: "UI = f(state)". React solved it the same way —
**React came first (2013), and Flutter (2017) was inspired by it.**

---

## 2. React — the UI library

React lets you describe the UI as a function of state, exactly like Flutter's `build()` method:

```tsx
// React
function Counter() {
  const [count, setCount] = useState(0)          // state
  return (
    <button onClick={() => setCount(count + 1)}>  {/* UI = f(state) */}
      Count: {count}
    </button>
  )
}
```

```dart
// Flutter
class Counter extends StatefulWidget { ... }
class _CounterState extends State<Counter> {
  int count = 0;
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => setState(() => count++),
      child: Text('Count: $count'),
    );
  }
}
```

When state changes, React **re-runs your function**, compares the new UI with the old one (this is
called **reconciliation**, using the **virtual DOM**), and changes **only** the parts of the real DOM
that are different. Flutter does the same with its Element tree.

### What React does NOT do

React is **only** the UI layer. It is a **library**, not a framework. React by itself does not give you:

- a way to run your code in development (dev server, hot reload)
- a way to turn JSX and TypeScript into normal JavaScript the browser understands
- routing (multiple pages / screens)
- data fetching rules, server code, SEO, image optimisation

Think about it like this: React is like the `flutter/widgets.dart` package **without** the Flutter CLI,
without `Navigator`, without `http`. You need other tools around it. That is where Vite and Next.js come in.

> The same React library is used by **React Native** to build mobile apps. React (the idea) is the
> same; only the "renderer" is different (`react-dom` for browsers, `react-native` for phones).

---

## 3. Why do we need a build tool? (the problem Vite solves)

You write code like this:

```tsx
import { useState } from 'react'          // import from node_modules
import './App.css'                        // import a CSS file?!
import logo from './logo.png'             // import an image?!

export function App(): JSX.Element {      // TypeScript types
  return <h1>Hello</h1>                   // JSX (HTML inside JS)
}
```

**The browser understands none of this.** Browsers do not understand TypeScript, JSX, importing CSS
files into JS, or `import 'react'` (a package name, not a URL).

So something must **transform** your code into plain JS/CSS/HTML. That something is a **build tool**
(also called a **bundler**). Vite is the most popular modern one.

Flutter comparison: you never run Dart source directly on a phone. `flutter build apk` compiles it.
`flutter run` gives you a dev mode with **hot reload**. Vite is the web version of those two commands.

---

## 4. Vite — the build tool and dev server

Vite (French for "fast", pronounced "veet") has **two jobs**:

| Command          | What it does                                                                      | Flutter equivalent |
| ---------------- | --------------------------------------------------------------------------------- | ------------------ |
| `npm run dev`    | Starts a **dev server** at `http://localhost:5173`, transforms files on demand, gives **HMR** (hot module replacement = hot reload) | `flutter run` + hot reload |
| `npm run build`  | Creates an optimised production folder `dist/` with small, minified `.html`, `.js`, `.css` files | `flutter build web` |

Vite does not care which UI library you use. It works with React, Vue, Svelte, or plain JS.
**"React with Vite"** just means: "a React app, using Vite as the build tool".

### Architecture of a React + Vite app: CSR / SPA

A React + Vite app is a **Single Page Application (SPA)** using **Client-Side Rendering (CSR)**.
"Client" = the browser. All the rendering happens in the user's browser.

```
                          BUILD TIME (on your laptop: npm run build)
   src/*.tsx, *.css  ───▶  Vite  ───▶  dist/
                                        ├── index.html        (almost EMPTY: <div id="root"></div>)
                                        └── assets/
                                            ├── index-a1b2.js  (ALL your React code + React itself)
                                            └── index-c3d4.css

                          RUN TIME (in the user's browser)
 ┌─────────┐  1. GET /           ┌──────────────────────────┐
 │ Browser │ ──────────────────▶ │ Any static file host     │   (Netlify, GitHub Pages,
 │         │ ◀────────────────── │ (no server code needed)  │    Firebase Hosting, S3 ...)
 │         │  2. index.html      └──────────────────────────┘
 │         │     (empty page!)
 │         │  3. downloads index-a1b2.js
 │         │  4. runs React → React builds the whole UI inside <div id="root">
 │         │  5. user clicks a link → React swaps the "screen" in JS. NO new page load.
 │         │  6. needs data → fetch('https://api.example.com/...') from the browser
 └─────────┘
```

Key facts:

- The server sends an **empty HTML page**. The user sees a blank screen until the JS downloads and runs.
- After that, everything is fast, because the whole app is already in the browser.
- It is **exactly like a Flutter web app** (Flutter web is also a SPA).
- Search engines and link previews (WhatsApp, Facebook) see an empty page → weaker **SEO**.
- You need a **separate backend** (Firebase, Supabase, Node/Express, Spring, Laravel...) for data.

Good for: dashboards, admin panels, internal tools, apps behind a login, things that feel like "apps".

---

## 5. Next.js — the full framework

Next.js is a **framework** built **on top of React**. It decides the project structure for you and adds:

| Feature                         | Meaning                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| **File-based routing**          | A file `app/about/page.tsx` automatically becomes the page `/about`. No router setup. |
| **Server rendering**            | React components can run **on a server** and send **finished HTML** to the browser. |
| **Server Components**           | Components that run only on the server. They can read a database directly.          |
| **Server Actions / API routes** | Write backend code (save to DB, call secret APIs) inside the same project.          |
| **Caching**                     | Pages and data can be prepared at build time and served instantly from a CDN.        |
| **Built-in optimisations**      | Images, fonts, SEO metadata, code splitting.                                         |
| **Its own build tool**          | Next.js uses **Turbopack**, not Vite. You do not use Vite with Next.js.               |

### Architecture of a Next.js app: server + client

```
 ┌─────────┐  1. GET /recipes         ┌───────────────────────────────────────────┐
 │ Browser │ ───────────────────────▶ │ Next.js server (Node.js)                  │
 │         │                          │  - runs your SERVER components            │
 │         │                          │  - can read DB / files / secret API keys  │
 │         │                          │  - builds the HTML (or uses a cached copy)│
 │         │ ◀─────────────────────── │                                           │
 │         │  2. FULL HTML: the list  └───────────────────────────────────────────┘
 │         │     of recipes is already
 │         │     in the page → user sees content immediately, Google can read it
 │         │  3. downloads a SMALLER JS bundle (only the interactive parts)
 │         │  4. "hydration": React attaches click handlers to the existing HTML
 │         │  5. user clicks a <Link> → Next fetches only the new part from the server,
 │         │     page does NOT fully reload (feels like a SPA)
 └─────────┘
```

Key facts:

- The user sees real content **immediately** (good for slow phones and slow internet).
- **SEO** is great because the HTML already contains the text.
- You need a **Node.js server** to host it (Vercel, Netlify, a VPS, Docker...), unless you export
  it as fully static.
- Your project contains **both** frontend and backend code. You must always know **where** a
  piece of code runs: server or browser. (Lesson 04-nextjs/03 teaches this.)

Good for: public websites, e-commerce, blogs, marketing pages, SaaS products, anything that needs
SEO or fast first load, and full-stack apps where you want frontend + backend in one project.

---

## 6. The rendering words you will hear (CSR, SSR, SSG, ISR, PPR)

These words describe **where and when the HTML is created**.

| Name    | Full name                           | Where/when HTML is made                             | Who uses it                  |
| ------- | ----------------------------------- | --------------------------------------------------- | ---------------------------- |
| **CSR** | Client-Side Rendering               | In the browser, after JS downloads                  | React + Vite, Flutter web    |
| **SSR** | Server-Side Rendering               | On the server, **on every request**                 | Next.js (dynamic pages)      |
| **SSG** | Static Site Generation              | On the server, **once at build time**               | Next.js (static pages)       |
| **ISR** | Incremental Static Regeneration     | At build time, then **re-built in the background** after some time | Next.js        |
| **PPR** | Partial Prerendering                | A static "shell" at build time + dynamic parts streamed in at request time | Next.js 16 default (Cache Components) |

A restaurant comparison:

- **CSR** — the restaurant gives you raw ingredients and a recipe. You cook at your table (browser does the work).
- **SSR** — the chef cooks your meal fresh when you order (server works on every request).
- **SSG** — meals were cooked this morning and are ready on the counter (super fast, but same for everyone).
- **ISR** — counter meals, but the chef re-cooks them every hour.
- **PPR** — the plate, rice and salad are ready on the counter; the hot curry is brought to you a moment later.

---

## 7. Side-by-side summary

|                          | React (alone)          | React + Vite                    | Next.js                                       |
| ------------------------ | ---------------------- | ------------------------------- | --------------------------------------------- |
| What is it               | UI library             | Library + build tool            | Full-stack framework                          |
| Rendering                | —                      | CSR (in browser)                | Server (SSR/SSG/PPR) + client                 |
| Routing                  | none                   | add **React Router** yourself   | built in (folders = routes)                   |
| Backend code             | none                   | none (separate backend)         | yes (Server Actions, Route Handlers)          |
| First page load          | —                      | blank until JS runs             | content immediately                           |
| SEO                      | —                      | weak                            | strong                                        |
| Hosting                  | —                      | any static host (cheap/free)    | Node server or a platform like Vercel         |
| Mental complexity        | low                    | low–medium                      | medium–high (server vs client)                |
| Flutter comparison       | widgets                | a Flutter web app               | Flutter app + a Dart backend in one project   |

### "Is it React OR Next.js?"

It is not "OR". **Next.js uses React.** All your React knowledge (components, props, state, hooks)
is used 100% inside Next.js. That is why this course teaches React first (with Vite, which is
simpler), then Next.js.

```
                  ┌───────────────────────────────┐
                  │           Next.js             │  routing, server, caching, build (Turbopack)
                  │   ┌───────────────────────┐   │
                  │   │        React          │   │  components, props, state, hooks
                  │   └───────────────────────┘   │
                  └───────────────────────────────┘

                  ┌───────────────────────────────┐
                  │   Vite (build + dev server)   │
                  │   ┌───────────────────────┐   │
                  │   │        React          │   │
                  │   └───────────────────────┘   │
                  │   + React Router (you add)    │
                  └───────────────────────────────┘
```

---

## 8. How to choose (simple rule)

1. Is the app **behind a login** (dashboard, admin, tool) and SEO does not matter? → **React + Vite**
2. Is it a **public website** that must load fast and be found on Google? → **Next.js**
3. Do you want **frontend + backend in one project** with one language? → **Next.js**
4. Do you already have a backend (Firebase, Spring, Laravel) and just need a UI? → **React + Vite** is simpler
5. Learning? → Learn **React with Vite first**, then **Next.js**. (This course does this.)

---

## 9. See it with your own eyes

Reading is not enough. Go to [practice/00-same-app-three-ways](../practice/00-same-app-three-ways/README.md).
You will run the **same small app** three ways and use **"View Page Source"** in the browser to see
the empty HTML of the Vite app and the full HTML of the Next.js app. After that lab, this lesson
will make complete sense.

## Check yourself

1. Why can't the browser run your `.tsx` files directly?
2. What does `npm run build` produce in a Vite project? Can you host it on GitHub Pages?
3. Your client wants an online shop that appears on Google. Vite or Next.js? Why?
4. What does "hydration" mean?
5. Is Next.js a replacement for React?

<details>
<summary>Answers</summary>

1. Browsers only understand HTML, CSS and plain JavaScript. TypeScript and JSX must be compiled first.
2. A `dist/` folder with `index.html` + JS + CSS files. Yes — it is just static files.
3. Next.js — the HTML is rendered on the server, so Google and link previews see the products.
4. React "attaches" event handlers and state to HTML that was already rendered by the server, so it becomes interactive.
5. No. Next.js is built **on** React. You write React components inside Next.js.

</details>
