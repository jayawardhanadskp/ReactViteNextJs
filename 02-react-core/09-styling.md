# React 09 — Styling

In Flutter, style is inside widgets (`TextStyle`, `BoxDecoration`, `ThemeData`). In React you have
several options. You will meet all of them in real projects, so learn to read each one.

| Way                 | Example                                  | Used for                                   |
| ------------------- | ---------------------------------------- | ------------------------------------------ |
| Plain CSS file      | `import './App.css'` + `className="card"` | small apps, global styles                 |
| **CSS Modules**     | `import s from './Card.module.css'` + `className={s.card}` | scoped styles per component |
| Inline `style`      | `style={{ color: 'red' }}`                | dynamic values (computed width, color from data) |
| **Tailwind CSS**    | `className="p-4 rounded-xl bg-white"`    | very popular; default in Next.js templates |
| Component libraries | MUI, shadcn/ui, Mantine, Chakra          | ready-made buttons, dialogs, inputs        |

## 1. Plain CSS

```css
/* src/App.css */
.card { padding: 16px; border-radius: 12px; background: white; }
.card-title { margin: 0 0 8px; }
```

```tsx
import './App.css'      // Vite injects it into the page

<div className="card"><h2 className="card-title">Hi</h2></div>
```

⚠️ Plain CSS is **global**. A `.card` class in one file affects every `.card` in the whole app.
In big apps, names collide. That's why CSS Modules and Tailwind exist.

## 2. CSS Modules — scoped CSS (recommended without Tailwind)

Name the file `*.module.css`. Vite (and Next.js) automatically make the class names unique.

```css
/* src/components/Card.module.css */
.card { padding: 16px; border-radius: 12px; background: white; }
.title { margin: 0; }
.highlighted { border: 2px solid gold; }
```

```tsx
// src/components/Card.tsx
import styles from './Card.module.css'

export function Card({ title, highlighted }: { title: string; highlighted?: boolean }) {
  return (
    <div className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  )
}
```

In the browser, the class becomes something like `_card_x7f2a_1` — it can never clash with another
`.card`. This feels like Flutter: the style belongs to the widget.

## 3. Conditional class names

Building class strings by hand gets messy. Use the tiny `clsx` package:

```bash
npm install clsx
```

```tsx
import clsx from 'clsx'

<button className={clsx('btn', isPrimary && 'btn-primary', disabled && 'btn-disabled')}>
// isPrimary = true, disabled = false → className="btn btn-primary"
```

## 4. Inline styles — for dynamic values

```tsx
<div style={{ width: `${progress}%`, backgroundColor: user.favoriteColor }} />
```

Good for values computed from data. Not good for everything: no `:hover`, no media queries, harder to reuse.

## 5. Tailwind CSS — utility classes

Instead of writing CSS, you combine small ready-made classes:

```tsx
<div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-md">
  <img className="h-12 w-12 rounded-full" src={avatar} alt="" />
  <div>
    <h2 className="text-lg font-semibold text-slate-900">Kasun</h2>
    <p className="text-sm text-slate-500">Flutter developer</p>
  </div>
  <button className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
    Follow
  </button>
</div>
```

It reads a bit like Flutter widget properties written inline:

| Tailwind                         | CSS                                    | Flutter                          |
| -------------------------------- | -------------------------------------- | -------------------------------- |
| `flex`                           | `display: flex`                        | `Row`                            |
| `flex flex-col`                  | `flex-direction: column`               | `Column`                         |
| `items-center`                   | `align-items: center`                  | `crossAxisAlignment.center`      |
| `justify-between`                | `justify-content: space-between`       | `mainAxisAlignment.spaceBetween` |
| `gap-4`                          | `gap: 1rem` (16px)                     | `SizedBox(16)` between children  |
| `p-4` / `px-4` / `py-2`          | padding 16px / horizontal / vertical   | `EdgeInsets.all(16)` / `symmetric` |
| `m-2`, `mt-4`, `ml-auto`         | margin                                 | —                                |
| `w-12 h-12`                      | width/height 3rem                      | `SizedBox(width: 48, height: 48)`|
| `rounded-xl`                     | `border-radius: 0.75rem`               | `BorderRadius.circular(12)`      |
| `bg-white text-slate-500`        | background / text color                | `color:` / `TextStyle(color:)`   |
| `text-lg font-semibold`          | font-size / weight                     | `TextStyle(fontSize:, fontWeight:)` |
| `shadow-md`                      | box-shadow                             | `BoxShadow`                      |
| `hover:bg-indigo-700`            | `:hover` style                         | —                                |
| `md:flex-row`                    | at ≥ 768px wide, use row               | `LayoutBuilder` breakpoint       |
| `dark:bg-slate-900`              | in dark mode                           | `ThemeMode.dark`                 |

The number scale: `1` = 0.25rem = 4px. So `p-4` = 16px, `gap-2` = 8px, `w-12` = 48px.

### Setting up Tailwind in a Vite project (Tailwind v4)

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css — replace everything with: */
@import "tailwindcss";
```

That's it. In **Next.js**, `create-next-app` sets Tailwind up for you (the recipe project uses it).

Custom theme colors (Tailwind v4 uses CSS):

```css
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;       /* now you can use bg-brand, text-brand, border-brand */
}
```

### Is Tailwind good or bad?

Pros: fast to write, no naming, no unused CSS, consistent spacing/colors, very popular in jobs.
Cons: long class lists. Fix: extract a **component** (`<Button>`) instead of repeating classes —
the same thing you'd do in Flutter with a reusable widget.

## 6. Component libraries

| Library        | Flutter feeling                       | Notes                                            |
| -------------- | ------------------------------------- | ------------------------------------------------ |
| **MUI**        | Material widgets                      | Google Material Design for React                 |
| **shadcn/ui**  | copy-paste widgets you own            | Tailwind-based; very popular with Next.js        |
| **Mantine**    | full widget set                       | many components + hooks                          |
| **Radix UI / React Aria** | unstyled accessible primitives | build your own design system                 |

## 7. Icons

```bash
npm install lucide-react
```

```tsx
import { Plus, Trash2, Heart } from 'lucide-react'

<button><Plus size={16} /> Add</button>
```

(Flutter: `Icon(Icons.add)`.)

## 8. Which one should I use?

- **Learning / small Vite app:** plain CSS + CSS Modules (the task manager project uses these).
- **Next.js / modern teams:** Tailwind (the recipe book project uses it).
- **Need a full design system fast:** shadcn/ui (Tailwind) or MUI.
