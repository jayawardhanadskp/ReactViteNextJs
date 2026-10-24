// Shown instantly while app/recipes/[id]/page.tsx is rendering.
// Next.js wraps the page in <Suspense fallback={<Loading />}> for you.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-label="Loading recipe">
      <div className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="h-10 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="h-5 w-full rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-6 h-48 rounded-2xl bg-stone-200 dark:bg-stone-800" />
    </div>
  )
}
