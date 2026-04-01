import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Access restricted' }

export default function NotAuthorizedPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <div className="text-7xl mb-6 select-none">🔒</div>
      <h1 className="text-2xl font-bold text-[#222] mb-2">Host access only</h1>
      <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
        This area is for hosts only. Upgrade your account to start listing
        your property and managing reservations.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white font-semibold hover:shadow-md transition-all"
        >
          Become a Host
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-[#e0e0e0] text-[#222] font-semibold hover:border-[#222] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
