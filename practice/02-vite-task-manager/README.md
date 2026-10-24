# Guided Project #1 — Task Manager (React + Vite)

👉 **Start with [TUTORIAL.md](TUTORIAL.md)** — it builds this app step by step from an empty folder.

This folder contains the **finished** app, so you can run it, compare, and peek when you're stuck.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

Uses: React 19 · Vite 8 · TypeScript · React Router 8 · Context + useReducer · localStorage · CSS Modules

```
src/
├── main.tsx                     BrowserRouter + TasksProvider + App
├── App.tsx                      all routes
├── types.ts                     Task, Priority, StatusFilter
├── index.css                    global styles / theme variables
├── state/
│   ├── tasksReducer.ts          pure state logic (Bloc-like)
│   └── TasksContext.tsx         provider + useTasks() + localStorage sync
├── hooks/useDocumentTitle.ts    custom hook
├── components/                  AppLayout, TaskForm, TaskItem (+ .module.css), FilterBar, ImportSampleTasks
└── pages/                       Dashboard, Tasks, TaskDetail, About, NotFound
```
