'use client' // Error boundaries must be Client Components
// Catches unexpected errors thrown while rendering any page below app/ (like ErrorWidget.builder).
import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error) // in a real app: send to an error tracking service
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-6xl">😵</p>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-stone-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onClick={() => retry()} className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
        Try again
      </button>
    </div>
  )
}
