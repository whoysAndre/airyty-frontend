import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Page not found' }

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <p className="text-8xl font-bold text-[#ff385c] mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-[#222] mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white font-semibold hover:shadow-md transition-all"
      >
        Back to home
      </Link>
    </main>
  )
}
