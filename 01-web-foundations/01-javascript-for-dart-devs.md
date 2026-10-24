# 01 — JavaScript for Dart Developers

Good news: Dart was designed to feel familiar to JavaScript developers. So most syntax will feel
normal. This lesson focuses on the **differences** and on the JS features React code uses
**all the time** (arrow functions, destructuring, spread, `map`/`filter`, modules, promises).

> You can run any example in this lesson. Create a file `test.js` and run `node test.js`,
> or paste into the browser Console (F12).

---

## 1. Variables: `const`, `let` (never `var`)

| Dart                | JavaScript         | Notes                                                |
| ------------------- | ------------------ | ---------------------------------------------------- |
| `final name = 'A';` | `const name = 'A'` | cannot be re-assigned. **Use this by default.**      |
| `var count = 0;`    | `let count = 0`    | can be re-assigned                                   |
| —                   | `var x = 1`        | old and buggy scoping. **Never use.**                |

```js
const user = { name: 'Kasun' }
user.name = 'Nimal'      // ✅ allowed! const only stops RE-ASSIGNING the variable
user = {}                // ❌ TypeError: Assignment to constant variable
```

Semicolons are **optional** in JS. Many React projects do not use them. Both are fine.

---

## 2. Types and the two "nothing" values

JS is **dynamically typed** (TypeScript adds types — next lesson). The basic types:

```js
const s = 'hello'          // string   ('single', "double" or `backtick` quotes)
const n = 42               // number   (NO separate int/double — every number is a double)
const b = true             // boolean
const nothing1 = null      // null      → "intentionally empty"
const nothing2 = undefined // undefined → "never set" (missing variable, missing property, missing argument)
const arr = [1, 2, 3]      // array     (Dart List)
const obj = { a: 1 }       // object    (like a Dart Map, but also used like a class instance)
```

Dart has one `null`. JS has **two**: `null` and `undefined`. You will see `undefined` often:

```js
const user = { name: 'Kasun' }
console.log(user.age)        // undefined (no error!)
function greet(name) { return name }
console.log(greet())         // undefined
```

---

## 3. Equality: always use `===`

```js
0 == ''        // true   😱  (== converts types)
0 === ''       // false  ✅
null == undefined   // true
null === undefined  // false
```

**Rule: always use `===` and `!==`.**

### Objects are compared by reference (very important for React)

```js
const a = { x: 1 }
const b = { x: 1 }
a === b        // false — two different objects in memory
const c = a
a === c        // true  — same object
```

React uses `===` to decide "did the state change?". If you modify an object instead of creating a
new one, React thinks **nothing changed** and does not re-render. Remember this for section 9.

---

## 4. Truthy and falsy

In Dart, `if` needs a real `bool`. In JS, **any value** can go in an `if`.

These are **falsy** (act like `false`): `false`, `0`, `''` (empty string), `null`, `undefined`, `NaN`.
**Everything else is truthy**, including `[]` and `{}`.

```js
const name = ''
if (name) { /* not executed */ }

const items = []
if (items) { /* executed! empty array is truthy */ }
if (items.length > 0) { /* ✅ correct way to check */ }
```

---

## 5. Null safety helpers (same as Dart!)

```js
const user = { profile: null }

user.profile?.photo          // undefined — no crash (Dart: user.profile?.photo)
const name = user.name ?? 'Guest'   // 'Guest'    (Dart: user.name ?? 'Guest')
let x = null
x ??= 5                      // x = 5          (Dart: x ??= 5)
```

`??` only falls back for `null`/`undefined`. `||` falls back for **any falsy** value:

```js
const count = 0
count ?? 10   // 0   ✅ usually what you want
count || 10   // 10  ⚠️ because 0 is falsy
```

---

## 6. Strings: template literals

```js
const name = 'Kasun'
const msg = `Hello ${name}, you have ${3 + 2} messages`   // backticks!
// Dart: 'Hello $name, you have ${3 + 2} messages'
```

---

## 7. Functions and arrow functions

```js
// 1. Function declaration
function add(a, b) {
  return a + b
}

// 2. Arrow function (used EVERYWHERE in React)
const add2 = (a, b) => {
  return a + b
}

// 3. Arrow function, short form — returns automatically (Dart: (a, b) => a + b)
const add3 = (a, b) => a + b

// One parameter: parentheses optional
const double = x => x * 2

// Returning an object in short form: wrap in ( ) !
const makeUser = name => ({ name, active: true })
```

Default parameter values:

```js
function greet(name = 'Guest') { return `Hi ${name}` }
```

JS has **no named parameters** like Dart `{required String name}`. Instead, we pass **one object**
and **destructure** it. This is exactly how React **props** work:

```js
// Dart:  void createUser({required String name, int age = 18})
function createUser({ name, age = 18 }) {
  console.log(name, age)
}
createUser({ name: 'Kasun' })      // Kasun 18
```

Functions are values (like Dart). You pass them around as callbacks:

```js
function runTwice(fn) { fn(); fn() }
runTwice(() => console.log('hi'))
```

---

## 8. Objects

```js
const user = {
  name: 'Kasun',
  age: 25,
  address: { city: 'Colombo' },
  greet() { return `Hi, I am ${this.name}` },
}

user.name             // 'Kasun'
user['name']          // 'Kasun' (like a Map)
user.address.city     // 'Colombo'
Object.keys(user)     // ['name', 'age', 'address', 'greet']
Object.entries({ a: 1, b: 2 })   // [['a', 1], ['b', 2]]
```

Shorthand: if the key and variable have the same name, write it once:

```js
const name = 'Kasun', age = 25
const user = { name, age }      // same as { name: name, age: age }
```

---

## 9. Destructuring and spread (you will use these 100 times a day)

### Destructuring = pull values out

```js
const user = { name: 'Kasun', age: 25, city: 'Colombo' }
const { name, age } = user                  // name = 'Kasun', age = 25
const { city: town } = user                 // rename: town = 'Colombo'
const { country = 'Sri Lanka' } = user      // default value

const colors = ['red', 'green', 'blue']
const [first, second] = colors              // first = 'red', second = 'green'
```

React's `useState` returns an array, so you destructure it:

```js
const [count, setCount] = useState(0)
```

### Spread `...` = copy values into a new object/array

```js
const user = { name: 'Kasun', age: 25 }
const older = { ...user, age: 26 }          // NEW object: { name: 'Kasun', age: 26 }
// Dart equivalent: user.copyWith(age: 26)

const nums = [1, 2, 3]
const more = [...nums, 4]                   // NEW array: [1, 2, 3, 4]
const merged = [...nums, ...more]
```

### Rest = collect "the remaining" values

```js
const { name, ...others } = { name: 'K', age: 25, city: 'C' }
// others = { age: 25, city: 'C' }
```

### Immutability — the most important rule for React

React state must be **replaced, not changed**. Use spread and array methods that return new arrays:

```js
// ❌ MUTATING (React will NOT see the change)
todos.push(newTodo)
user.age = 26
todos[0].done = true

// ✅ CREATING NEW VALUES (React sees a new reference → re-renders)
const todos2 = [...todos, newTodo]                               // add
const todos3 = todos.filter(t => t.id !== idToRemove)            // remove
const todos4 = todos.map(t => t.id === id ? { ...t, done: true } : t)   // update one
const user2 = { ...user, age: 26 }
```

Think of it like Flutter's immutable state with `copyWith` in Bloc/Riverpod.

---

## 10. Array methods (Dart has almost the same ones)

```js
const nums = [1, 2, 3, 4, 5]

nums.map(n => n * 2)              // [2, 4, 6, 8, 10]       Dart: .map().toList()
nums.filter(n => n % 2 === 0)     // [2, 4]                 Dart: .where().toList()
nums.find(n => n > 2)             // 3  (or undefined)      Dart: .firstWhere()
nums.findIndex(n => n > 2)        // 2
nums.some(n => n > 4)             // true                   Dart: .any()
nums.every(n => n > 0)            // true                   Dart: .every()
nums.includes(3)                  // true                   Dart: .contains()
nums.reduce((sum, n) => sum + n, 0)   // 15                 Dart: .fold(0, ...)
nums.slice(0, 2)                  // [1, 2]  (new array)    Dart: .sublist(0, 2)
nums.length                       // 5
nums.join(', ')                   // '1, 2, 3, 4, 5'
[...nums].reverse()               // copy first, because reverse() mutates
nums.toSorted((a, b) => b - a)    // [5, 4, 3, 2, 1] — new array (sort() mutates!)
```

`map` returns an array **directly** — no `.toList()` needed. In React, you use `map` to turn data
into a list of UI elements (like `ListView` children):

```jsx
<ul>
  {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
</ul>
```

---

## 11. Modules: `import` / `export`

Each file is a module. Things are private unless you `export` them.

```js
// math.js
export const PI = 3.14                       // named export
export function add(a, b) { return a + b }   // named export
export default function multiply(a, b) {     // default export (max ONE per file)
  return a * b
}
```

```js
// app.js
import multiply, { PI, add } from './math.js'   // default without { }, named inside { }
import { add as plus } from './math.js'         // rename
import * as math from './math.js'               // everything: math.add, math.PI
import { useState } from 'react'                // from an npm package (node_modules)
```

Dart comparison: `import 'package:flutter/material.dart';` — but in JS you must name exactly
what you import (or use `* as`).

---

## 12. Async: Promises and `async`/`await`

A JS `Promise` = a Dart `Future`. `async`/`await` work the same way.

```js
// Dart:
// Future<User> loadUser() async {
//   final res = await http.get(Uri.parse('https://...'));
//   return User.fromJson(jsonDecode(res.body));
// }

async function loadUser(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const user = await res.json()      // parse JSON → plain JS object (no fromJson needed)
  return user
}

try {
  const user = await loadUser(1)     // top-level await works in modules
  console.log(user.name)
} catch (err) {
  console.error('Failed:', err.message)
}
```

Running in parallel (Dart `Future.wait`):

```js
const [user, posts] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
])
```

`.then()` is the older style (like Dart `.then()`): `fetch(url).then(r => r.json()).then(data => ...)`.

Timers:

```js
setTimeout(() => console.log('after 1 second'), 1000)     // Dart: Future.delayed
const id = setInterval(() => console.log('tick'), 1000)   // Dart: Timer.periodic
clearInterval(id)                                          // timer.cancel()
```

---

## 13. Classes (exist, but React rarely uses them)

```js
class Animal {
  #secret = 'hidden'         // private field (# prefix; Dart uses _)
  constructor(name) { this.name = name }
  speak() { return `${this.name} makes a sound` }
}
class Dog extends Animal {
  speak() { return `${this.name} barks` }
}
new Dog('Rex').speak()
```

Old React used class components. **Modern React uses only functions + hooks.** You can ignore
classes for React work.

---

## 14. Quick reference: Dart → JS

| Dart                                   | JavaScript                                   |
| -------------------------------------- | -------------------------------------------- |
| `print(x)`                             | `console.log(x)`                             |
| `final` / `var`                        | `const` / `let`                              |
| `List<int> a = [1,2]`                  | `const a = [1, 2]`                           |
| `Map<String,int> m = {'a': 1}`         | `const m = { a: 1 }` (or `new Map()`)        |
| `a.length`, `a.isEmpty`                | `a.length`, `a.length === 0`                 |
| `'$name'`                              | `` `${name}` ``                              |
| `x is String`                          | `typeof x === 'string'`                      |
| `a.where(...).toList()`                | `a.filter(...)`                              |
| `jsonEncode(obj)` / `jsonDecode(s)`    | `JSON.stringify(obj)` / `JSON.parse(s)`      |
| `int.parse('5')`                       | `Number('5')` or `parseInt('5', 10)`         |
| `x.toString()`                         | `String(x)` or `x.toString()`                |
| `DateTime.now()`                       | `new Date()`                                 |
| `Future.delayed(Duration(seconds: 1))` | `new Promise(r => setTimeout(r, 1000))`      |
| `throw Exception('x')`                 | `throw new Error('x')`                       |

Now do the exercises: [exercises/README.md](exercises/README.md) (01 and 02 cover this lesson).
