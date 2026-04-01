'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, Minus, Plus, AlertCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { bookingsApi } from '@/lib/api/bookings.api'
import { paymentsApi } from '@/lib/api/payments.api'
import { useAuthStore } from '@/store/auth.store'
import type { ListingDetail } from '@/types/listing.types'

interface Props {
  listing: ListingDetail
}

export function BookingWidget({ listing }: Props) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookedId, setBookedId] = useState<string | null>(null)
  const [bookedTotal, setBookedTotal] = useState('')
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [payError, setPayError] = useState('')
  const [mounted, setMounted] = useState(false)

  const { user, token, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const today = new Date().toISOString().split('T')[0]

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0

  const pricePerNight = parseFloat(listing.pricePerNight)
  const subtotal = nights * pricePerNight

  const handleReserve = async () => {
    if (!mounted) return

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/listings/${listing.id}`)
      return
    }

    if (!checkIn || !checkOut || nights <= 0) {
      setError('Select valid check-in and check-out dates')
      return
    }

    if (user?.id === listing.hostId) {
      setError("You can't book your own listing")
      return
    }

    setLoading(true)
    setError('')

    try {
      const booking = await bookingsApi.create({ listingId: listing.id, checkIn, checkOut, guestCount: guests }, token!)
      setBookedId(booking.id)
      setBookedTotal(booking.totalPrice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (bookedId) {
    if (paid) {
      return (
        <div className="border border-green-200 bg-green-50 rounded-2xl p-6 shadow-xl text-center animate-fadeIn">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#222] mb-2">Booking Confirmed!</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Payment of <span className="font-semibold text-[#222]">${parseFloat(bookedTotal).toFixed(2)}</span> processed.
            Your stay at <span className="font-semibold text-[#222]">{listing.title}</span> is confirmed.
          </p>
          <Link
            href="/bookings/my-bookings"
            className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white font-semibold text-center hover:shadow-md transition-all"
          >
            View my bookings
          </Link>
        </div>
      )
    }

    const handlePay = async () => {
      setPaying(true)
      setPayError('')
      try {
        await paymentsApi.pay(bookedId, token!)
        setPaid(true)
      } catch (err) {
        setPayError(err instanceof Error ? err.message : 'Payment failed')
      } finally {
        setPaying(false)
      }
    }

    return (
      <div className="border border-[#ddd] rounded-2xl p-6 shadow-xl animate-fadeIn">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#222] mb-1 text-center">Booking Requested!</h3>
        <p className="text-gray-500 text-sm mb-5 text-center leading-relaxed">
          Reserve your spot now — pay and confirm instantly.
        </p>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total due</span>
          <span className="text-lg font-bold text-[#222]">${parseFloat(bookedTotal).toFixed(2)}</span>
        </div>

        {payError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{payError}</p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-200 mb-3"
        >
          {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Pay now</>}
        </button>

        <Link
          href="/bookings/my-bookings"
          className="block text-center text-sm text-gray-500 hover:text-[#222] underline transition-colors"
        >
          Pay later from My Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-[#ddd] rounded-2xl p-6 shadow-xl sticky top-[85px]">
      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-2xl font-bold text-[#222]">
          ${pricePerNight.toFixed(0)}
        </span>
        <span className="text-gray-500 text-base">/ night</span>
      </div>

      {/* Dates + Guests box */}
      <div className="border border-[#b0b0b0] rounded-xl overflow-hidden mb-3">
        {/* Dates row */}
        <div className="grid grid-cols-2 divide-x divide-[#b0b0b0]">
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#222] mb-1.5">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) setCheckOut('')
              }}
              className="w-full text-sm text-[#222] outline-none bg-transparent cursor-pointer"
            />
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#222] mb-1.5">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm text-[#222] outline-none bg-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Guests row */}
        <div className="border-t border-[#b0b0b0] px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#222]">Guests</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests((v) => Math.max(1, v - 1))}
              disabled={guests <= 1}
              className="w-7 h-7 rounded-full border border-[#b0b0b0] flex items-center justify-center text-[#222] hover:border-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-semibold w-4 text-center text-[#222]">{guests}</span>
            <button
              onClick={() => setGuests((v) => Math.min(listing.maxGuests, v + 1))}
              disabled={guests >= listing.maxGuests}
              className="w-7 h-7 rounded-full border border-[#b0b0b0] flex items-center justify-center text-[#222] hover:border-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-red-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Reserving...
          </>
        ) : !mounted || !isAuthenticated ? (
          'Sign in to reserve'
        ) : (
          'Reserve'
        )}
      </button>

      <p className="text-center text-gray-400 text-xs mt-2.5">You won&apos;t be charged yet</p>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="mt-5 pt-5 border-t border-[#e0e0e0] space-y-2.5">
          <div className="flex justify-between text-sm text-[#222]">
            <span className="underline decoration-dotted">
              ${pricePerNight.toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#222] text-base pt-3 border-t border-[#e0e0e0]">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
