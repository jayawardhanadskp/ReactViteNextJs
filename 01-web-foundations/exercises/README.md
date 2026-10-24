# Web Foundations — Exercises

Small TypeScript exercises. Node.js 22.18+ can run `.ts` files directly — no setup, no install.

```bash
cd 01-web-foundations/exercises
node 01-basics.ts
```

At the start you will see many ❌. Open the file, find each `TODO`, write the code, run again.
Repeat until everything is ✅. Then compare your code with the file in `solutions/`.

| File                           | Practises                                                    | After lesson |
| ------------------------------ | ------------------------------------------------------------ | ------------ |
| `01-basics.ts`                 | functions, destructuring, template strings, `?.`, `??`, rest, spread | 01 JavaScript |
| `02-arrays-immutability.ts`    | `map`, `filter`, `reduce`, adding/updating/removing **without mutating** | 01 JavaScript |
| `03-async-and-types.ts`        | `async`/`await`, `Promise.all`, `try`/`catch`, union types, `switch` | 02 TypeScript |

> **Exercise 02 is the most important one.** Updating arrays and objects without changing the
> original is exactly how you update state in React. If you can do exercise 02 easily, React
> state will be easy.

Tip: in VS Code, hover over a variable to see its TypeScript type. Red underlines = type errors
(just like the Dart analyzer). Node only removes the types and runs the code — it does not check them.
To check types like `flutter analyze` does, run `npm run typecheck` in this folder.
