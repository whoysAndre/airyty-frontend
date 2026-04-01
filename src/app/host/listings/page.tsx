'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Loader2, Trash2, Eye, EyeOff, ArrowLeft, Pencil } from 'lucide-react'
import { listingsApi } from '@/lib/api/listings.api'
import { useAuthStore } from '@/store/auth.store'
import type { ListingDetail } from '@/types/listing.types'

export default function HostListingsPage() {
  const [listings, setListings] = useState<ListingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    listingsApi.getMyListings(token!).then(setListings).finally(() => setLoading(false))
  }, [token])

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    try {
      const updated = await listingsApi.toggleActive(id, token!)
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)))
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await listingsApi.deleteListing(id, token!)
      setListings((prev) => prev.filter((l) => l.id !== id))
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] hover:underline mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Home
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">My Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your properties</p>
        </div>
        <Link
          href="/host/listings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white text-sm font-semibold hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          New listing
        </Link>
      </div>

      {/* Nav */}
      <div className="flex gap-6 border-b border-[#e0e0e0] mb-8">
        <Link href="/host/listings" className="pb-3 text-sm font-semibold text-[#222] border-b-2 border-[#222]">
          Listings
        </Link>
        <Link href="/host/bookings" className="pb-3 text-sm font-medium text-gray-500 hover:text-[#222] transition-colors">
          Incoming Bookings
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-24 animate-fadeIn">
          <div className="text-6xl mb-5 select-none">🏠</div>
          <h2 className="text-xl font-bold text-[#222] mb-2">No listings yet</h2>
          <p className="text-gray-500 mb-6">List your first property and start hosting</p>
          <Link href="/host/listings/new" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Create listing
          </Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {listings.map((listing) => {
            const img = listing.images[0]?.url
            return (
              <div key={listing.id} className={`flex gap-4 p-4 border rounded-2xl transition-all ${listing.isActive ? 'border-[#e0e0e0] bg-white' : 'border-[#e0e0e0] bg-gray-50 opacity-70'}`}>
                {/* Image */}
                <Link href={`/listings/${listing.id}`} className="relative w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {img ? (
                    <Image src={img} alt={listing.title} fill className="object-cover" sizes="144px" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-3xl">🏠</div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/listings/${listing.id}`} className="font-semibold text-[#222] hover:underline truncate">
                      {listing.title}
                    </Link>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${listing.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{listing.city}, {listing.country}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {listing.maxGuests} guests · <span className="font-semibold text-[#222]">${parseFloat(listing.pricePerNight).toFixed(0)}</span> / night
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Edit */}
                    <Link
                      href={`/host/listings/${listing.id}/edit`}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#222] font-medium transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>

                    <span className="text-gray-300">|</span>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(listing.id)}
                      disabled={togglingId === listing.id}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#222] font-medium transition-colors disabled:opacity-50"
                    >
                      {togglingId === listing.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : listing.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {listing.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <span className="text-gray-300">|</span>

                    {/* Delete */}
                    {confirmDelete === listing.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 font-medium">Sure?</span>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          className="text-sm text-red-600 font-semibold hover:underline disabled:opacity-50"
                        >
                          {deletingId === listing.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Yes, delete'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="text-sm text-gray-500 hover:underline">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(listing.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
