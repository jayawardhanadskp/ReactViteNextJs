// Exercise 01 — JavaScript basics (functions, objects, ?. and ??, template strings)
// Run:  node 01-basics.ts
// SOLUTION
import { check, summary } from '../check.ts'

// 1. Return "first last" using a template string.
//    Hint: destructure the parameter: ({ first, last }) => ...
export function fullName(person: { first: string; last: string }): string {
  const { first, last } = person
  return `${first} ${last}`
}

// 2. Return "Hello, <name>!" — if name is missing (undefined), use "Guest".
//    Hint: default parameter value OR the ?? operator.
export function greet(name?: string): string {
  return `Hello, ${name ?? 'Guest'}!`
}

// 3. Return how many words are in the sentence. Words are separated by spaces.
//    Extra spaces must not create empty words: "  hi   there " → 2
//    Hint: .trim(), .split(' '), .filter(w => w !== '')
export function countWords(sentence: string): number {
  return sentence
    .trim()
    .split(' ')
    .filter((word) => word !== '').length
}

// 4. Return the user's city. If user, address, or city is missing → "Unknown".
//    Hint: optional chaining ?. and ??
type User = { name: string; address?: { city?: string } | null }
export function cityOf(user: User | null): string {
  return user?.address?.city ?? 'Unknown'
}

// 5. Return the sum of ANY number of arguments: sumAll(1, 2, 3) → 6, sumAll() → 0
//    Hint: rest parameter (...nums) and .reduce()
export function sumAll(...nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0)
}

// 6. Return a NEW object: same user, but with `age` increased by 1.
//    The original object must NOT change. Hint: spread { ...user, age: ... }
export function birthday(user: { name: string; age: number }): { name: string; age: number } {
  return { ...user, age: user.age + 1 }
}

// ---------- checks (don't edit below) ----------
console.log('Exercise 01 — basics')
check('fullName', fullName({ first: 'Kasun', last: 'Perera' }), 'Kasun Perera')
check('greet with name', greet('Nimal'), 'Hello, Nimal!')
check('greet without name', greet(), 'Hello, Guest!')
check('countWords normal', countWords('I love React'), 3)
check('countWords extra spaces', countWords('  hi   there '), 2)
check('countWords empty', countWords('   '), 0)
check('cityOf full', cityOf({ name: 'A', address: { city: 'Kandy' } }), 'Kandy')
check('cityOf no address', cityOf({ name: 'A', address: null }), 'Unknown')
check('cityOf null user', cityOf(null), 'Unknown')
check('sumAll', sumAll(1, 2, 3, 4), 10)
check('sumAll empty', sumAll(), 0)
const original = { name: 'Kasun', age: 25 }
const older = birthday(original)
check('birthday returns age+1', older.age, 26)
check('birthday does not mutate original', original.age, 25)
check('birthday returns a new object', older !== original, true)
summary()
