# 03 — HTML & CSS for Flutter Developers

In Flutter, layout and style are properties of widgets. On the web they are split:
**HTML** = which elements exist, **CSS** = how they look and where they go.
The good news: **CSS Flexbox works almost exactly like Flutter `Row` and `Column`**
(Flutter's layout was inspired by it).

---

## 1. HTML elements you need

```html
<!-- Text -->
<h1>Big title</h1> ... <h6>small title</h6>
<p>A paragraph of text.</p>
<span>Inline text</span>  <strong>bold</strong>  <em>italic</em>

<!-- Boxes (like Container) -->
<div>A generic block box</div>

<!-- Semantic boxes: same as div, but give MEANING (good for accessibility and SEO) -->
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

<!-- Lists -->
<ul> <li>item</li> <li>item</li> </ul>      <!-- bullets -->
<ol> <li>first</li> <li>second</li> </ol>   <!-- numbers -->

<!-- Links and images -->
<a href="/about">About us</a>
<img src="/cat.png" alt="A sleeping cat" />   <!-- alt = description for screen readers -->

<!-- Forms -->
<form>
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="you@mail.com" />
  <input type="password" />
  <input type="checkbox" />
  <textarea></textarea>
  <select> <option value="lk">Sri Lanka</option> </select>
  <button type="submit">Send</button>
</form>
```

**Block vs inline:** `div`, `p`, `h1`, `section`, `ul` are **block** elements — each starts on a new
line and takes the full width (like a widget in a `Column` with `crossAxisAlignment.stretch`).
`span`, `a`, `strong`, `img` are **inline** — they sit inside a line of text.

---

## 2. Three ways to add CSS

```html
<!-- 1. A CSS file (most common) -->
<link rel="stylesheet" href="styles.css" />

<!-- 2. A <style> tag -->
<style> p { color: gray; } </style>

<!-- 3. Inline style attribute -->
<p style="color: red; font-size: 20px">Hello</p>
```

In React you usually import a CSS file (`import './App.css'`) and use `className`.

---

## 3. CSS syntax and selectors

```css
selector {
  property: value;
}

p { color: gray; }                 /* every <p> */
.card { padding: 16px; }           /* every element with class="card"  ← use this most */
#header { height: 64px; }          /* the element with id="header" */
.card h2 { margin: 0; }            /* <h2> inside .card */
.btn:hover { opacity: 0.8; }       /* when mouse is over */
.btn:disabled { opacity: 0.4; }
.item:first-child { }              /* first item */
```

Use **classes** for styling. Think of a class like a reusable `TextStyle` / `BoxDecoration`.

---

## 4. The box model = Container

Every element is a box:

```
┌──────────────── margin (space OUTSIDE, between boxes) ───────────────┐
│ ┌──────────── border ─────────────────────────────────────────────┐ │
│ │ ┌──────── padding (space INSIDE) ─────────────────────────────┐ │ │
│ │ │                                                             │ │ │
│ │ │                 content (width × height)                    │ │ │
│ │ │                                                             │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

```css
.card {
  width: 300px;
  padding: 16px;                    /* all sides       — EdgeInsets.all(16) */
  padding: 8px 16px;                /* vertical horiz. — EdgeInsets.symmetric(v: 8, h: 16) */
  margin: 0 auto;                   /* center a block horizontally */
  border: 1px solid #ddd;
  border-radius: 12px;              /* BorderRadius.circular(12) */
  background: white;                /* color: Colors.white */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);   /* BoxShadow */
}

/* Put this in every project (Vite/Next templates already do): width includes padding+border */
*, *::before, *::after { box-sizing: border-box; }
```

Flutter equivalent of `.card` above:

```dart
Container(
  width: 300,
  padding: EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: Colors.white,
    border: Border.all(color: Color(0xFFDDDDDD)),
    borderRadius: BorderRadius.circular(12),
    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 2))],
  ),
)
```

---

## 5. Flexbox = Row and Column ⭐

```css
.row {
  display: flex;                /* turn on flexbox. Default direction = row → Flutter Row */
  flex-direction: row;          /* or column → Flutter Column */
  justify-content: space-between;  /* MAIN axis   → mainAxisAlignment */
  align-items: center;             /* CROSS axis  → crossAxisAlignment */
  gap: 12px;                       /* space between children → SizedBox between children */
}
```

| Flutter                                   | CSS                                     |
| ----------------------------------------- | --------------------------------------- |
| `Row(...)`                                | `display: flex`                         |
| `Column(...)`                             | `display: flex; flex-direction: column` |
| `MainAxisAlignment.start / center / end`  | `justify-content: flex-start / center / flex-end` |
| `MainAxisAlignment.spaceBetween / Around / Evenly` | `justify-content: space-between / space-around / space-evenly` |
| `CrossAxisAlignment.start / center / end` | `align-items: flex-start / center / flex-end` |
| `CrossAxisAlignment.stretch`              | `align-items: stretch` (**this is the CSS default!**) |
| `Expanded(child: ...)`                    | child gets `flex: 1`                    |
| `Expanded(flex: 2)`                       | child gets `flex: 2`                    |
| `Flexible`                                | `flex: 0 1 auto` (the default)          |
| `Wrap`                                    | `flex-wrap: wrap`                       |
| `mainAxisSize: MainAxisSize.min`          | `display: inline-flex`                  |

Example — an app bar:

```html
<header class="appbar">
  <h1>My App</h1>
  <div class="spacer"></div>
  <button>Login</button>
</header>
```

```css
.appbar { display: flex; align-items: center; gap: 8px; padding: 0 16px; height: 56px; }
.spacer { flex: 1; }     /* Flutter: Spacer() */
```

## 6. Grid = GridView

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 3 equal columns — crossAxisCount: 3 */
  gap: 16px;
}

/* Responsive grid: as many 200px+ columns as fit — no media query needed! */
.gallery-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* Center anything (Flutter Center) */
.center { display: grid; place-items: center; }
```

## 7. Position = Stack + Positioned

```css
.avatar-wrapper { position: relative; }      /* Stack */
.badge {
  position: absolute;                         /* Positioned */
  top: -4px;
  right: -4px;
}
.fab { position: fixed; bottom: 24px; right: 24px; }   /* stays on screen while scrolling */
.appbar { position: sticky; top: 0; }                  /* sticks to the top when scrolling */
```

## 8. Units, colors, text

```css
.text {
  font-size: 16px;        /* px = logical pixels (like Flutter) */
  font-size: 1rem;        /* rem = relative to root font size (usually 16px). Preferred for text */
  width: 50%;             /* percent of the parent */
  height: 100vh;          /* vh = % of the screen height (MediaQuery height) */
  max-width: 800px;       /* BoxConstraints(maxWidth: 800) */

  color: #1e293b;         /* hex like 0xFF1E293B */
  color: rgb(30 41 59);
  color: rgb(0 0 0 / 50%);/* with opacity */

  font-weight: 600;       /* FontWeight.w600 */
  line-height: 1.5;       /* height: 1.5 in TextStyle */
  text-align: center;
  text-decoration: none;  /* remove underline on links */
}
```

## 9. Responsive design = MediaQuery / LayoutBuilder

```css
.layout { display: flex; flex-direction: row; }

/* When the screen is 600px or less, switch to a column */
@media (max-width: 600px) {
  .layout { flex-direction: column; }
}

/* Dark mode: follow the system setting (like ThemeMode.system) */
@media (prefers-color-scheme: dark) {
  body { background: #0f172a; color: #e2e8f0; }
}
```

Always add this to your HTML `<head>` (templates already do):
`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.

## 10. CSS variables = ThemeData

```css
:root {
  --primary: #6366f1;
  --radius: 12px;
}
.button { background: var(--primary); border-radius: var(--radius); }
```

Change `--primary` once and the whole app changes — like a theme.

## 11. Transitions = implicit animations

```css
.button {
  transition: background 200ms ease, transform 200ms ease;   /* AnimatedContainer */
}
.button:hover { background: #4f46e5; transform: scale(1.05); }
```

---

## Try it now (5 minutes)

Create a file `card.html` anywhere, paste this, and double-click it to open in your browser.
Then open DevTools → Elements, click on elements, and change CSS values live.

```html
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root { --primary: #6366f1; }
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0;
           min-height: 100vh; display: grid; place-items: center; }
    .card { width: 320px; background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 4px 16px rgb(0 0 0 / 10%); display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--primary);
              color: white; display: grid; place-items: center; font-size: 24px; }
    .name { margin: 0; font-size: 1.25rem; }
    .role { margin: 0; color: #64748b; }
    button { background: var(--primary); color: white; border: 0; padding: 10px 16px;
             border-radius: 8px; font-size: 1rem; cursor: pointer; transition: transform 150ms; }
    button:hover { transform: scale(1.03); }
  </style>
</head>
<body>
  <div class="card">
    <div class="row">
      <div class="avatar">K</div>
      <div>
        <h2 class="name">Kasun</h2>
        <p class="role">Flutter developer → React developer</p>
      </div>
    </div>
    <p>This card is a Container with a Column, and a Row inside it.</p>
    <button>Follow</button>
  </div>
</body>
</html>
```

**Challenge:** add a second button next to "Follow" ("Message") so both buttons share the width
equally. (Hint: wrap them in a `div` with `display: flex; gap: 8px` and give each button `flex: 1`.)
