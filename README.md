# Flutter → React Web: a full course for Flutter developers

You already know how to build UIs. In Flutter you build a **widget tree**, keep **state**,
call `setState`, use `FutureBuilder`, `Provider`, and `Navigator`.
React works on the **same ideas** with different names. This course teaches React, Vite,
and Next.js by comparing everything to Flutter.

Everything you need is inside this folder: lessons, code, exercises, and full projects.
You do not need to open any documentation website.

---

## The 30-second answer: what are React, Vite and Next.js?

| Thing      | What it is                                   | Flutter comparison                                          |
| ---------- | -------------------------------------------- | ----------------------------------------------------------- |
| **React**  | A UI **library**. Builds UI from components. | The **widget system** (`StatelessWidget`, `StatefulWidget`) |
| **Vite**   | A **build tool** + dev server for web code.  | The `flutter run` / `flutter build` tooling + hot reload    |
| **Next.js**| A full **framework** built on React.         | Flutter **+** a backend server **+** file-based routing     |

- **React + Vite** = a normal web app that runs fully in the browser (a "SPA"). Like a Flutter app.
- **Next.js** = React that also runs on a **server**. Pages can be built on the server, so they load
  fast and Google can read them. It also lets you write backend code in the same project.

Full explanation with diagrams: [00-start-here/01-big-picture.md](00-start-here/01-big-picture.md)

---

## Folder map

```
flutter-to-react-web/
├── README.md                     ← you are here (the roadmap)
├── 00-start-here/                ← the big picture, setup, Flutter→React cheat sheet
├── 01-web-foundations/           ← JavaScript, TypeScript, HTML & CSS for a Dart/Flutter dev
│   └── exercises/                ← small runnable TypeScript exercises (with solutions)
├── 02-react-core/                ← React itself: components, props, state, effects, context, routing
├── 03-vite/                      ← how Vite works and how a Vite project is organised
├── 04-nextjs/                    ← Next.js: server rendering, App Router, server components, actions
├── 05-whats-next.md              ← the ecosystem, and where to go after this course
└── practice/
    ├── 00-same-app-three-ways/   ← ONE app built 3 ways (plain React, Vite, Next) to SEE the difference
    ├── 01-react-playground/      ← Vite app with 7 hands-on exercises (TODOs + solutions)
    ├── 02-vite-task-manager/     ← Guided project #1: a full React + Vite app
    └── 03-next-recipe-book/      ← Guided project #2: a full Next.js app with a server
```

---

## The learning path (about 4–6 weeks at 1–2 hours per day)

Do the steps **in order**. Each step says what to read and what to build.
Tick the boxes as you go.

### Week 1 — Understand the web and the big picture

- [ ] Read [00-start-here/01-big-picture.md](00-start-here/01-big-picture.md) — what each tool is, and the architecture
- [ ] Do [00-start-here/02-setup.md](00-start-here/02-setup.md) — install Node, VS Code extensions
- [ ] Keep [00-start-here/03-flutter-to-react-cheatsheet.md](00-start-here/03-flutter-to-react-cheatsheet.md) open while learning
- [ ] Read [01-web-foundations/01-javascript-for-dart-devs.md](01-web-foundations/01-javascript-for-dart-devs.md)
- [ ] Read [01-web-foundations/02-typescript-for-dart-devs.md](01-web-foundations/02-typescript-for-dart-devs.md)
- [ ] Read [01-web-foundations/03-html-css-for-flutter-devs.md](01-web-foundations/03-html-css-for-flutter-devs.md)
- [ ] Do the exercises in [01-web-foundations/exercises](01-web-foundations/exercises/README.md)
- [ ] Do the lab [practice/00-same-app-three-ways](practice/00-same-app-three-ways/README.md) (**very important** — this is where the architecture "clicks")

### Week 2 — React core (with Vite)

Read one lesson, then do the matching exercise in the playground
([practice/01-react-playground](practice/01-react-playground/README.md)).

| Lesson                                                                                   | Playground exercise         |
| ---------------------------------------------------------------------------------------- | --------------------------- |
| [01 Components & JSX](02-react-core/01-components-and-jsx.md)                            | —                           |
| [02 Props & children](02-react-core/02-props-and-children.md)                            | Ex 1 — Profile card         |
| [03 State with useState](02-react-core/03-state-with-useState.md)                        | Ex 2 — Counter              |
| [04 Events & forms](02-react-core/04-events-and-forms.md)                                | Ex 3 — Login form           |
| [05 Lists & conditional UI](02-react-core/05-lists-and-conditional-ui.md)                | Ex 4 — Shopping list        |
| [06 useEffect & fetching data](02-react-core/06-useEffect-and-fetching-data.md)          | Ex 5 — User fetcher         |
| [07 Sharing state & Context](02-react-core/07-sharing-state-and-context.md)              | Ex 6 — Theme switcher       |
| [08 useRef, useMemo, custom hooks](02-react-core/08-useRef-useMemo-custom-hooks.md)      | Ex 7 — Stopwatch            |
| [09 Styling](02-react-core/09-styling.md)                                                | —                           |
| [10 Routing with React Router](02-react-core/10-routing-with-react-router.md)            | —                           |

### Week 3 — Vite + your first real app

- [ ] Read [03-vite/01-vite-explained.md](03-vite/01-vite-explained.md)
- [ ] Build **Guided project #1**: [practice/02-vite-task-manager/TUTORIAL.md](practice/02-vite-task-manager/TUTORIAL.md)

### Week 4 — Next.js

- [ ] [04-nextjs/01-why-nextjs-and-rendering.md](04-nextjs/01-why-nextjs-and-rendering.md)
- [ ] [04-nextjs/02-project-anatomy-and-routing.md](04-nextjs/02-project-anatomy-and-routing.md)
- [ ] [04-nextjs/03-server-vs-client-components.md](04-nextjs/03-server-vs-client-components.md)
- [ ] [04-nextjs/04-data-fetching-caching-streaming.md](04-nextjs/04-data-fetching-caching-streaming.md)
- [ ] [04-nextjs/05-server-actions-and-route-handlers.md](04-nextjs/05-server-actions-and-route-handlers.md)
- [ ] [04-nextjs/06-loading-errors-metadata-images.md](04-nextjs/06-loading-errors-metadata-images.md)
- [ ] [04-nextjs/07-deploying-and-choosing.md](04-nextjs/07-deploying-and-choosing.md)

### Week 5–6 — Build the Next.js project, then your own

- [ ] Build **Guided project #2**: [practice/03-next-recipe-book/TUTORIAL.md](practice/03-next-recipe-book/TUTORIAL.md)
- [ ] Read [05-whats-next.md](05-whats-next.md)
- [ ] **Final challenge**: rebuild one of your Flutter apps as a web app (ideas inside `05-whats-next.md`)

---

## How to study (important)

1. **Type the code yourself.** Do not copy-paste. Your fingers learn the syntax.
2. **Break things on purpose.** Remove a `key`, forget a dependency, see the error. Errors teach you.
3. **Always ask "what is the Flutter version of this?"** — the cheat sheet helps.
4. **Use the browser DevTools** (F12 / Cmd+Option+I). It is your Flutter DevTools.
5. Every guided project has a **finished version** in the folder. Build your own copy in a new folder
   first, and only look at the finished code when you are stuck.

## Versions used in this course (October 2026)

React 19 · Vite 8 · Next.js 16 (App Router, Cache Components) · React Router 8 · TypeScript · Node 22+
