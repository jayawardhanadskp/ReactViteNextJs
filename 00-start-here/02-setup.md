# 02 — Setup: your tools (Flutter SDK → Node.js)

## 1. Node.js and npm

| Flutter world             | Web world                           |
| ------------------------- | ----------------------------------- |
| Flutter SDK / Dart SDK    | **Node.js** (runs JS outside the browser; runs Vite, Next.js, tools) |
| `pub` / `flutter pub`     | **npm** (comes with Node.js)        |
| `pubspec.yaml`            | **`package.json`**                  |
| `pubspec.lock`            | **`package-lock.json`**             |
| `.dart_tool/`, `build/`   | **`node_modules/`** (all downloaded packages — never edit, never commit) |
| pub.dev                   | **npmjs.com**                       |

Check that Node is installed (you need version **22 or newer**):

```bash
node -v     # e.g. v22.x or newer
npm -v
```

If not installed: download the **LTS** version from nodejs.org, or on macOS:

```bash
brew install node
```

## 2. The npm commands you will use every day

| Command                           | Meaning                                               | Flutter equivalent        |
| --------------------------------- | ----------------------------------------------------- | ------------------------- |
| `npm install`                     | download all packages listed in `package.json`        | `flutter pub get`         |
| `npm install react-router`        | add a package (to `dependencies`)                     | `flutter pub add x`       |
| `npm install -D vitest`           | add a **dev-only** package (`devDependencies`)        | `flutter pub add -d x`    |
| `npm uninstall x`                 | remove a package                                      | `flutter pub remove x`    |
| `npm run dev`                     | run the `"dev"` script from `package.json`            | `flutter run`             |
| `npm run build`                   | run the `"build"` script                              | `flutter build`           |
| `npx something`                   | run a tool **without installing it globally**         | `dart run something`      |
| `npm create vite@latest`          | run a project generator                               | `flutter create`          |

`package.json` scripts are just shortcuts (the `//` comments are only for explanation — real JSON files cannot contain comments):

```jsonc
{
  "scripts": {
    "dev": "vite",            // npm run dev   → runs "vite"
    "build": "vite build",    // npm run build → runs "vite build"
    "preview": "vite preview"
  }
}
```

## 3. VS Code extensions (recommended)

- **ESLint** — shows code problems (like `flutter analyze`)
- **Prettier – Code formatter** — formats code on save (like `dart format`)
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes (used in the Next.js project)
- **ES7+ React snippets** (optional) — type `rafce` to create a component quickly

Turn on format-on-save: Settings → search "format on save" → tick it.

## 4. Browser DevTools = Flutter DevTools

Open Chrome → right-click on page → **Inspect** (or `Cmd + Option + I`).

| Tab              | Use it for                                                | Flutter equivalent        |
| ---------------- | --------------------------------------------------------- | ------------------------- |
| **Elements**     | see the DOM tree and CSS of each element, edit live       | Widget Inspector          |
| **Console**      | see `console.log(...)` output and errors                  | debug console / `print()` |
| **Network**      | see every HTTP request (API calls, JS files, images)      | Network tab               |
| **Sources**      | set breakpoints in your code                              | debugger                  |
| **Application**  | see `localStorage`, cookies                               | shared_preferences viewer |

Also install the **React Developer Tools** browser extension (from the Chrome Web Store).
It adds a **Components** tab where you see your React component tree with props and state —
very similar to the Flutter Widget Inspector.

## 5. Create your first app (2 minutes test)

```bash
cd ~/Desktop
npm create vite@latest hello-react -- --template react-ts
cd hello-react
npm install
npm run dev
```

Open the URL it prints (`http://localhost:5173`). Open `src/App.tsx`, change some text, save.
The browser updates instantly — that is **HMR** (hot reload). 🎉

Press `Ctrl + C` in the terminal to stop the server.

You can delete this test app after. You will create real ones in the practice folder.

## 6. Running the projects in this course

Every project in `practice/` works the same way:

```bash
cd practice/01-react-playground
npm install        # only the first time (downloads node_modules)
npm run dev        # start
```
