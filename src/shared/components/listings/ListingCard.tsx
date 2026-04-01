'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { Listing } from '@/types/listing.types'

interface Props {
  listing: Listing
}

export function ListingCard({ listing }: Props) {
  const [liked, setLiked] = useState(false)
  const mainImage = listing.images[0]?.url

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-100 to-red-100 flex items-center justify-center">
            <span className="text-5xl select-none">🏠</span>
          </div>
        )}

        {/* Heart */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked((v) => !v)
          }}
          className="absolute top-3 right-3 p-1 rounded-full hover:scale-110 transition-transform"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-[22px] h-[22px] drop-shadow transition-colors ${
              liked
                ? 'fill-[#ff385c] stroke-[#ff385c]'
                : 'fill-black/20 stroke-white stroke-2'
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[#222] text-[15px] truncate">
            {listing.city}, {listing.country}
          </p>
          <div className="flex items-center gap-0.5 text-[13px] text-[#222] shrink-0">
            <span>★</span>
            <span>New</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm truncate">{listing.title}</p>
        <p className="text-gray-400 text-sm">Up to {listing.maxGuests} guests</p>
        <p className="text-[15px] text-[#222] mt-0.5">
          <span className="font-semibold">${parseFloat(listing.pricePerNight).toFixed(0)}</span>
          <span className="text-gray-500 font-normal"> / night</span>
        </p>
      </div>
    </Link>
  )
}
