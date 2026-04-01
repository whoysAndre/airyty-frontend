'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Users, MapPin, Loader2, ArrowLeft, CreditCard, RotateCcw } from 'lucide-react'
import { bookingsApi } from '@/lib/api/bookings.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { useAuthStore } from '@/store/auth.store'
import type { Booking, BookingStatus } from '@/types/booking.types'

const STATUS = {
  PENDING:   { label: 'Pending',   classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-green-50  text-green-700  border-green-200'  },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-50   text-gray-500   border-gray-200'   },
  COMPLETED: { label: 'Completed', classes: 'bg-blue-50   text-blue-700   border-blue-200'   },
} satisfies Record<BookingStatus, { label: string; classes: string }>

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function nights(checkIn: string, checkOut: string) {
  return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 864e5)
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<Record<string, string>>({})
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return
    bookingsApi
      .getMyBookings(token)
      .then(setBookings)
      .catch((err) => setFetchError(err instanceof Error ? err.message : 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [token])

  const clearActionError = (id: string) =>
    setActionError((prev) => { const next = { ...prev }; delete next[id]; return next })

  const handlePay = async (booking: Booking) => {
    setActionId(booking.id)
    clearActionError(booking.id)
    try {
      await paymentsApi.pay(booking.id, token!)
      // Payment auto-confirms the booking
      setBookings((prev) =>
        prev.map((b) => b.id === booking.id ? { ...b, status: 'CONFIRMED' } : b)
      )
    } catch (err) {
      setActionError((prev) => ({
        ...prev,
        [booking.id]: err instanceof Error ? err.message : 'Payment failed',
      }))
    } finally {
      setActionId(null)
    }
  }

  const handleRefund = async (booking: Booking) => {
    setActionId(booking.id)
    clearActionError(booking.id)
    try {
      await paymentsApi.refund(booking.id, token!)
      // Refund cancels the booking
      setBookings((prev) =>
        prev.map((b) => b.id === booking.id ? { ...b, status: 'CANCELLED' } : b)
      )
    } catch (err) {
      setActionError((prev) => ({
        ...prev,
        [booking.id]: err instanceof Error ? err.message : 'Refund failed',
      }))
    } finally {
      setActionId(null)
    }
  }

  const handleCancel = async (booking: Booking) => {
    setActionId(booking.id)
    clearActionError(booking.id)
    try {
      const updated = await bookingsApi.cancel(booking.id, token!)
      setBookings((prev) => prev.map((b) => b.id === booking.id ? updated : b))
    } catch (err) {
      setActionError((prev) => ({
        ...prev,
        [booking.id]: err instanceof Error ? err.message : 'Cancellation failed',
      }))
    } finally {
      setActionId(null)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] hover:underline mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to listings
      </Link>

      <h1 className="text-2xl font-bold text-[#222] mb-1">My Bookings</h1>
      <p className="text-gray-500 text-sm mb-8">Your full reservation history</p>

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
          <div className="text-6xl mb-5 select-none">🧳</div>
          <h2 className="text-xl font-bold text-[#222] mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-6">Time to plan your next adventure</p>
          <Link href="/" className="inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white text-sm font-semibold hover:shadow-md transition-all">
            Explore stays
          </Link>
        </div>
      )}

      {!loading && !fetchError && bookings.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {bookings.map((booking) => {
            const n = nights(booking.checkIn, booking.checkOut)
            const badge = STATUS[booking.status]
            const img = booking.listing.images?.[0]?.url
            const busy = actionId === booking.id
            const err = actionError[booking.id]

            return (
              <div key={booking.id} className="flex gap-4 p-4 border border-[#e0e0e0] rounded-2xl hover:shadow-md transition-shadow bg-white">
                {/* Image */}
                <Link href={`/listings/${booking.listingId}`} className="relative w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {img ? (
                    <Image src={img} alt={booking.listing.title} fill className="object-cover" sizes="144px" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-3xl">🏠</div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/listings/${booking.listingId}`} className="font-semibold text-[#222] hover:underline truncate">
                      {booking.listing.title}
                    </Link>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.listing.city}, {booking.listing.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {n} night{n !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="font-semibold text-[#222]">
                      Total: <span className="text-[#ff385c]">${parseFloat(booking.totalPrice).toFixed(2)}</span>
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Pay now — only for PENDING */}
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handlePay(booking)}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 shadow-sm shadow-red-200"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          Pay now
                        </button>
                      )}

                      {/* Refund — only for CONFIRMED (paid bookings) */}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleRefund(booking)}
                          disabled={busy}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#222] disabled:opacity-50 transition-colors"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          Refund
                        </button>
                      )}

                      {/* Cancel — only for PENDING (without paying) */}
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(booking)}
                          disabled={busy}
                          className="text-sm font-semibold text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {err && (
                    <p className="text-xs text-red-500 mt-2">{err}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
