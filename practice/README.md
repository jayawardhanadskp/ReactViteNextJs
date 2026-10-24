# Practice

Do these in order. Each folder has its own README.

| #   | Folder                                                     | What                                                  | When (see main README) |
| --- | ---------------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| 00  | [00-same-app-three-ways](00-same-app-three-ways/README.md) | Lab: one app as plain React, React + Vite, Next.js    | Week 1                 |
| 01  | [01-react-playground](01-react-playground/README.md)       | 7 exercises (TODOs + solutions), React + Vite         | Week 2                 |
| 02  | [02-vite-task-manager](02-vite-task-manager/TUTORIAL.md)   | Guided project: multi-page React + Vite app           | Week 3                 |
| 03  | [03-next-recipe-book](03-next-recipe-book/TUTORIAL.md)     | Guided project: full-stack Next.js app                | Weeks 5–6              |

Every project:

```bash
cd <folder>
npm install      # first time only
npm run dev
```

The first `npm install` in each folder downloads packages into `node_modules/` (a few hundred MB for
Next.js). That's normal — like the Flutter pub cache. You can delete `node_modules/` any time and
reinstall.
