'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, CalendarDays, Users, MapPin } from 'lucide-react'
import { bookingsApi } from '@/lib/api/bookings.api'
import { useAuthStore } from '@/store/auth.store'
import type { Booking, BookingStatus } from '@/types/booking.types'

const STATUS = {
  PENDING:   { label: 'Pending',   classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-green-50  text-green-700  border-green-200'  },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-50   text-gray-500   border-gray-200'   },
  COMPLETED: { label: 'Completed', classes: 'bg-blue-50   text-blue-700   border-blue-200'   },
} satisfies Record<BookingStatus, { label: string; classes: string }>

const TRANSITIONS: Partial<Record<BookingStatus, { label: string; next: BookingStatus; style: string }[]>> = {
  PENDING: [
    { label: 'Confirm',  next: 'CONFIRMED', style: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Decline',  next: 'CANCELLED', style: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
  CONFIRMED: [
    { label: 'Complete', next: 'COMPLETED', style: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Cancel',   next: 'CANCELLED', style: 'border border-red-300 text-red-600 hover:bg-red-50' },
  ],
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function nights(checkIn: string, checkOut: string) {
  return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 864e5)
}

export default function HostBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return
    bookingsApi
      .getHostIncoming(token)
      .then(setBookings)
      .catch((err) => setFetchError(err instanceof Error ? err.message : 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [token])

  const handleStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id)
    try {
      const updated = await bookingsApi.updateStatus(id, status, token!)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/host/listings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] hover:underline mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        My listings
      </Link>

      <h1 className="text-2xl font-bold text-[#222] mb-1">Incoming Bookings</h1>
      <p className="text-gray-500 text-sm mt-0.5 mb-8">Reservations for your properties</p>

      {/* Nav */}
      <div className="flex gap-6 border-b border-[#e0e0e0] mb-8">
        <Link href="/host/listings" className="pb-3 text-sm font-medium text-gray-500 hover:text-[#222] transition-colors">
          Listings
        </Link>
        <Link href="/host/bookings" className="pb-3 text-sm font-semibold text-[#222] border-b-2 border-[#222]">
          Incoming Bookings
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
        </div>
      )}

      {!loading && fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && bookings.length === 0 && (
        <div className="text-center py-24 animate-fadeIn">
          <div className="text-6xl mb-5 select-none">📭</div>
          <h2 className="text-xl font-bold text-[#222] mb-2">No bookings yet</h2>
          <p className="text-gray-500">Guests will appear here once they book your listings</p>
        </div>
      )}

      {!loading && !fetchError && bookings.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {bookings.map((booking) => {
            const badge = STATUS[booking.status]
            const actions = TRANSITIONS[booking.status] ?? []
            const n = nights(booking.checkIn, booking.checkOut)

            return (
              <div key={booking.id} className="p-5 border border-[#e0e0e0] rounded-2xl bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-[#222]">{booking.listing?.title ?? 'Listing unavailable'}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.listing?.city}, {booking.listing?.country}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badge.classes}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {n} night{n !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold text-[#222]">
                    Total: ${parseFloat(booking.totalPrice).toFixed(2)}
                  </span>
                </div>

                {actions.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {actions.map(({ label, next, style }) => (
                      <button
                        key={next}
                        onClick={() => handleStatus(booking.id, next)}
                        disabled={updatingId === booking.id}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 ${style}`}
                      >
                        {updatingId === booking.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
