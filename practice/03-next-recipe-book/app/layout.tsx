// ROOT LAYOUT: wraps every page (like MaterialApp + a shared Scaffold).
// It's a Server Component. It stays mounted while you navigate between pages.
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

// next/font downloads the font at BUILD time and serves it from your own site (no layout jump)
const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s · Recipe Book', // pages set their own title, e.g. "Pol Roti · Recipe Book"
    default: 'Recipe Book',
  },
  description: 'Sri Lankan recipes — a Next.js practice project for Flutter developers.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              🍲 Recipe Book
            </Link>
            <Link href="/recipes" className="text-stone-600 hover:text-orange-600 dark:text-stone-300">
              All recipes
            </Link>
            <Link
              href="/recipes/new"
              className="ml-auto rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              + New recipe
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500 dark:border-stone-800">
          Built with Next.js · data lives in <code>data/recipes.json</code> · API at{' '}
          <Link href="/api/recipes" className="underline">
            /api/recipes
          </Link>
        </footer>
      </body>
    </html>
  )
}
