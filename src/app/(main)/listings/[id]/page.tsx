'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Users, ArrowLeft, CalendarDays, Share2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { listingsApi } from '@/lib/api/listings.api'
import { ImageGallery } from '@/shared/components/listings/ImageGallery'
import { BookingWidget } from '@/shared/components/listings/BookingWidget'
import type { ListingDetail } from '@/types/listing.types'

function DetailSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-32 mb-5" />
      <div className="h-8 bg-gray-200 rounded-full w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-6" />
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 rounded-full ${i % 3 === 2 ? 'w-1/2' : 'w-full'}`} />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </main>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    listingsApi
      .getById(id)
      .then(setListing)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DetailSkeleton />

  if (notFound || !listing) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-5">🏚️</div>
        <h2 className="text-2xl font-bold text-[#222] mb-2">Listing not found</h2>
        <p className="text-gray-500 mb-6">This listing may have been removed or deactivated.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222] text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
      </main>
    )
  }

  const memberYear = new Date(listing.createdAt).getFullYear()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#222] font-semibold hover:underline mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        All stays
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222] leading-tight">
          {listing.title}
        </h1>
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-[#222] font-semibold hover:underline shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {listing.city}, {listing.country}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          Up to {listing.maxGuests} guests
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <CalendarDays className="w-4 h-4" />
          Listed {memberYear}
        </span>
      </div>

      {/* Image gallery */}
      <div className="mb-10">
        <ImageGallery images={listing.images} title={listing.title} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host */}
          <div className="flex items-center justify-between pb-8 border-b border-[#e0e0e0]">
            <div>
              <h2 className="text-xl font-bold text-[#222] mb-0.5">
                Hosted by {listing.host.name}
              </h2>
              <p className="text-gray-500 text-sm">Member since {memberYear}</p>
            </div>
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-200 shrink-0">
              {listing.host.avatarUrl ? (
                <Image
                  src={listing.host.avatarUrl}
                  alt={listing.host.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl select-none">
                  {listing.host.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-8 border-b border-[#e0e0e0]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold text-[#222] text-sm">Entire place</p>
                <p className="text-gray-500 text-xs mt-0.5">You'll have the property to yourself</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-[#222] text-sm">Enhanced clean</p>
                <p className="text-gray-500 text-xs mt-0.5">Committed to Airbnb's cleaning standards</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-[#222] text-sm">Great location</p>
                <p className="text-gray-500 text-xs mt-0.5">{listing.city}, {listing.country}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-8 border-b border-[#e0e0e0]">
            <h2 className="text-xl font-bold text-[#222] mb-4">About this place</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-bold text-[#222] mb-4">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '👥', label: `Up to ${listing.maxGuests} guests` },
                { icon: '🌍', label: `${listing.city}, ${listing.country}` },
                { icon: '💰', label: `$${parseFloat(listing.pricePerNight).toFixed(0)} per night` },
                { icon: '📅', label: 'Flexible cancellation' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-[#222]">
                  <span className="text-xl">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Booking widget */}
        <div>
          <BookingWidget listing={listing} />
        </div>
      </div>

      {/* Mobile booking bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ddd] px-4 py-3 flex items-center justify-between z-40">
        <div>
          <p className="font-bold text-[#222]">
            ${parseFloat(listing.pricePerNight).toFixed(0)}
            <span className="font-normal text-gray-500 text-sm"> / night</span>
          </p>
        </div>
        <Link
          href="#booking"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white text-sm font-semibold"
        >
          Reserve
        </Link>
      </div>
    </main>
  )
}
