// Tiny test helper used by the exercises. You don't need to edit this file.
let passed = 0
let failed = 0

export function check(name: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    passed++
    console.log(`  ✅ ${name}`)
  } else {
    failed++
    console.log(`  ❌ ${name}`)
    console.log(`       expected: ${JSON.stringify(expected)}`)
    console.log(`       actual:   ${JSON.stringify(actual)}`)
  }
}

export function summary(): void {
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed === 0) console.log('🎉 All done! Compare with the file in solutions/ to see another way.')
}
