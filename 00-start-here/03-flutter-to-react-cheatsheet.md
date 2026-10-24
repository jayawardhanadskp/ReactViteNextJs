# 03 — Flutter → React Cheat Sheet

Keep this open while learning. Every Flutter idea you know has a React name.

## Core concepts

| Flutter                                   | React                                                         |
| ----------------------------------------- | ------------------------------------------------------------- |
| Widget                                    | Component                                                     |
| `StatelessWidget`                         | A function component with no state                            |
| `StatefulWidget` + `State`                | A function component that uses `useState`                     |
| `build(BuildContext context)`             | The component function body + its `return (...)`              |
| Constructor parameters (`final String title`) | **Props** (`{ title }: { title: string }`)                |
| `child` / `children`                      | `children` prop                                               |
| `setState(() => count++)`                 | `setCount(count + 1)` or `setCount(c => c + 1)`               |
| `initState()`                             | `useEffect(() => { ... }, [])`                                |
| `dispose()`                               | the **cleanup function** returned from `useEffect`            |
| `didUpdateWidget`                         | `useEffect(() => { ... }, [someProp])`                        |
| `Key` / `ValueKey`                        | `key` prop (required in lists)                                |
| `GlobalKey` / `TextEditingController`     | `useRef`                                                      |
| `InheritedWidget` / `Provider`            | **Context** (`createContext` + `useContext`)                  |
| `ChangeNotifier` / Riverpod / Bloc        | `useReducer` + Context, or **Zustand**, Redux Toolkit         |
| `FutureBuilder`                           | `useEffect` + state, or **TanStack Query**, or `<Suspense>` + `use()` |
| `StreamBuilder`                           | `useEffect` that subscribes + cleanup                         |
| `const` widget                            | `React.memo(Component)` (rarely needed)                       |
| `Builder`, extracting widgets             | Extracting components / **custom hooks** for logic            |
| `hot reload`                              | **HMR** (Hot Module Replacement) / Fast Refresh               |

## Layout widgets → HTML + CSS

| Flutter                              | React / HTML + CSS                                                   |
| ------------------------------------ | -------------------------------------------------------------------- |
| `Container`                          | `<div>` with CSS                                                     |
| `Text('hi')`                         | `<p>hi</p>`, `<span>`, `<h1>`… (text can be written directly)        |
| `Column`                             | `<div style={{ display: 'flex', flexDirection: 'column' }}>`         |
| `Row`                                | `<div style={{ display: 'flex' }}>` (row is the default direction)   |
| `mainAxisAlignment`                  | `justify-content`                                                    |
| `crossAxisAlignment`                 | `align-items`                                                        |
| `SizedBox(height: 16)` between items | `gap: 16px` on the parent                                            |
| `Expanded`                           | `flex: 1`                                                            |
| `Padding`                            | `padding: 16px`                                                      |
| `Center`                             | `display: grid; place-items: center`                                 |
| `Stack` + `Positioned`               | `position: relative` on parent + `position: absolute` on child       |
| `Wrap`                               | `display: flex; flex-wrap: wrap`                                     |
| `GridView`                           | `display: grid; grid-template-columns: repeat(3, 1fr)`               |
| `ListView`                           | a normal list + `overflow-y: auto` (the page scrolls by default!)    |
| `SingleChildScrollView`              | nothing — web pages scroll automatically                             |
| `Image.network(url)`                 | `<img src={url} alt="..." />`                                        |
| `Image.asset('assets/x.png')`        | `import x from './x.png'` then `<img src={x} />` (Vite) or put it in `public/` |
| `Icon(Icons.add)`                    | an icon library like `lucide-react`: `<Plus />`                      |
| `Divider`                            | `<hr />`                                                             |
| `Card`                               | `<div className="card">` + CSS (`border-radius`, `box-shadow`)       |
| `MediaQuery.of(context).size.width`  | CSS **media queries** `@media (max-width: 600px) {}`                 |
| `Theme.of(context)`                  | CSS variables `var(--primary)` or a Context                          |

## Input widgets

| Flutter                         | React                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `ElevatedButton(onPressed:)`    | `<button onClick={...}>`                                           |
| `TextField(controller:)`        | `<input value={text} onChange={e => setText(e.target.value)} />`   |
| `Checkbox(value, onChanged)`    | `<input type="checkbox" checked={v} onChange={e => setV(e.target.checked)} />` |
| `DropdownButton`                | `<select value={v} onChange={...}><option>...</option></select>`   |
| `Form` + `GlobalKey<FormState>` | `<form onSubmit={...}>` (call `e.preventDefault()`)                |
| `GestureDetector(onTap:)`       | `onClick` on almost any element                                    |

## Navigation

| Flutter                                 | React Router (Vite)                     | Next.js                          |
| --------------------------------------- | --------------------------------------- | -------------------------------- |
| `MaterialApp(routes: {...})`            | `<Routes><Route path=... /></Routes>`   | folders inside `app/`            |
| `Navigator.pushNamed(ctx, '/about')`    | `navigate('/about')` (`useNavigate`)    | `router.push('/about')` (`useRouter`) |
| A tappable link                         | `<Link to="/about">`                    | `<Link href="/about">`           |
| `Navigator.pop(ctx)`                    | `navigate(-1)`                          | `router.back()`                  |
| route arguments                         | URL params `/tasks/:id` + `useParams()` | folder `[id]` + `params` prop    |
| `Scaffold` shared across screens        | layout route with `<Outlet />`          | `layout.tsx`                     |
| go_router                               | React Router (very similar idea!)       | built in                         |

## Async & data

| Dart                                | JavaScript / TypeScript                        |
| ----------------------------------- | ---------------------------------------------- |
| `Future<T>`                         | `Promise<T>`                                   |
| `async` / `await`                   | `async` / `await` (same!)                      |
| `http.get(Uri.parse(url))`          | `fetch(url)`                                   |
| `jsonDecode(res.body)`              | `await res.json()`                             |
| `Future.wait([...])`                | `Promise.all([...])`                           |
| `shared_preferences`                | `localStorage.setItem('k', 'v')`               |
| `Stream`                            | event listeners, WebSocket, `EventSource`      |

## Tooling

| Flutter                     | Web                                    |
| --------------------------- | -------------------------------------- |
| `flutter create`            | `npm create vite@latest` / `npx create-next-app@latest` |
| `flutter pub get`           | `npm install`                          |
| `flutter run`               | `npm run dev`                          |
| `flutter build web`         | `npm run build`                        |
| `flutter analyze`           | `npm run lint` + `tsc` (type check)    |
| `flutter test`              | `vitest` / `jest` + Testing Library    |
| `pubspec.yaml`              | `package.json`                         |
| `lib/main.dart`             | `src/main.tsx` (Vite) / `app/layout.tsx` (Next) |
| `assets/` + pubspec entry   | `public/` folder (no config needed)    |
| `.env` + `flutter_dotenv`   | `.env` (`VITE_*` in Vite, `NEXT_PUBLIC_*` in Next for browser code) |
