# Practice 01 — React Playground (React + Vite)

A small Vite app with **7 exercises**, one for each React core lesson.

```bash
cd practice/01-react-playground
npm install      # first time only
npm run dev      # open http://localhost:5173
```

## How it works

```
src/
├── App.tsx                ← the playground menu (don't edit)
├── index.css              ← global styles + helper classes (card, row, stack, btn, input...)
├── exercises/             ← ✏️ YOUR files — edit these
│   ├── Ex1ProfileCard.tsx
│   ├── Ex2Counter.tsx
│   ├── Ex3LoginForm.tsx
│   ├── Ex4ShoppingList.tsx
│   ├── Ex5UserFetcher.tsx
│   ├── Ex6ThemeSwitcher.tsx
│   └── Ex7Stopwatch.tsx
└── solutions/             ← finished versions (try not to peek too early!)
```

1. Choose an exercise in the left menu.
2. Open the matching file in `src/exercises/`. **The instructions are in the comment at the top.**
3. Complete the `TODO`s. Save → the browser updates instantly (HMR).
4. Use the **My code / Solution** switch (top right) to compare the behaviour with the finished version.
5. When done, read the solution file and compare it with your code.

| #   | Exercise        | Lesson                                  | You practise                                      |
| --- | --------------- | --------------------------------------- | ------------------------------------------------- |
| 1   | Profile card    | 02 Props & children                     | props types, defaults, callbacks, `children`      |
| 2   | Counter         | 03 useState                             | state, updater function, derived values           |
| 3   | Login form      | 04 Events & forms                       | controlled inputs, validation, async submit       |
| 4   | Shopping list   | 05 Lists & conditional UI               | `map` + `key`, add/toggle/remove immutably, filters |
| 5   | User fetcher    | 06 useEffect & fetching                 | effects, loading/error, abort, dependencies       |
| 6   | Theme switcher  | 07 Context                              | create / provide / consume context, custom hook   |
| 7   | Stopwatch       | 08 useRef & custom hooks                | refs, intervals, cleanup, custom hook             |

## Tips

- Open the browser **Console** (F12) — React prints helpful warnings (missing `key`, etc.).
- Install the **React Developer Tools** extension and open the **Components** tab to see props and state live.
- `npm run lint` shows "unused variable" warnings for unfinished exercises — that's expected.
- `npm run build` type-checks everything. Run it when you finish an exercise to catch type errors.

## Extra challenges (after finishing all 7)

- Ex 2: save the counter in `localStorage` so it survives a page reload (write a `useLocalStorage` hook).
- Ex 4: add an "edit name" mode (double-click an item to edit it).
- Ex 5: also load the user's posts (`/posts?userId=1`) in parallel with `Promise.all`.
- Ex 6: remember the theme in `localStorage`, and start with the system theme
  (`window.matchMedia('(prefers-color-scheme: dark)').matches`).
- Ex 7: show the fastest lap in green and the slowest in red.
