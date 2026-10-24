import { useEffect } from 'react'

// A tiny custom hook: sets the browser tab title while the page is shown.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · Task Manager`
    return () => {
      document.title = previous
    }
  }, [title])
}
