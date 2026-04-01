'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { ListingFilters } from '@/types/listing.types'

interface Props {
  filters: ListingFilters
  onFilter: (f: ListingFilters) => void
}

export function ListingFilters({ filters, onFilter }: Props) {
  const [city, setCity] = useState(filters.city ?? '')
  const [country, setCountry] = useState(filters.country ?? '')
  const [guests, setGuests] = useState(filters.guests?.toString() ?? '')
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? '')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sync inputs when URL filters change externally
  useEffect(() => {
    setCity(filters.city ?? '')
    setCountry(filters.country ?? '')
    setGuests(filters.guests?.toString() ?? '')
    setMinPrice(filters.minPrice?.toString() ?? '')
    setMaxPrice(filters.maxPrice?.toString() ?? '')
  }, [filters.city, filters.country, filters.guests, filters.minPrice, filters.maxPrice])

  const hasFilters = city || country || guests || minPrice || maxPrice

  const handleSearch = () => {
    onFilter({
      city: city || undefined,
      country: country || undefined,
      guests: guests ? Number(guests) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
    })
  }

  const handleClear = () => {
    setCity('')
    setCountry('')
    setGuests('')
    setMinPrice('')
    setMaxPrice('')
    setShowAdvanced(false)
    onFilter({ page: 1 })
  }

  return (
    <div className="sticky top-[65px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main bar */}
        <div className="flex gap-2 items-center">
          {/* City */}
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="City"
            className="flex-1 min-w-0 px-4 py-2.5 border border-[#ddd] rounded-full text-sm text-[#222] placeholder:text-gray-400 focus:outline-none focus:border-[#222] focus:ring-2 focus:ring-[#222]/10 transition-colors"
          />

          {/* Country */}
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Country"
            className="flex-1 min-w-0 hidden sm:block px-4 py-2.5 border border-[#ddd] rounded-full text-sm text-[#222] placeholder:text-gray-400 focus:outline-none focus:border-[#222] focus:ring-2 focus:ring-[#222]/10 transition-colors"
          />

          {/* Guests */}
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Guests"
            min={1}
            className="w-24 hidden md:block px-4 py-2.5 border border-[#ddd] rounded-full text-sm text-[#222] placeholder:text-gray-400 focus:outline-none focus:border-[#222] transition-colors"
          />

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2.5 border rounded-full text-sm font-medium transition-colors shrink-0 ${
              showAdvanced || minPrice || maxPrice
                ? 'border-[#222] text-[#222] bg-gray-50'
                : 'border-[#ddd] text-gray-600 hover:border-[#222]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#ff385c] to-[#e31c5f] text-white rounded-full text-sm font-semibold hover:shadow-md hover:shadow-red-200 transition-all active:scale-95 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={handleClear}
              className="p-2.5 border border-[#ddd] rounded-full text-gray-500 hover:border-[#222] hover:text-[#222] transition-colors shrink-0"
              aria-label="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="mt-3 flex flex-wrap gap-3 items-center animate-fadeIn">
            <span className="text-sm text-gray-500 font-medium">Price per night:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min $"
                min={0}
                className="w-24 px-3 py-2 border border-[#ddd] rounded-xl text-sm text-[#222] focus:outline-none focus:border-[#222] transition-colors"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max $"
                min={0}
                className="w-24 px-3 py-2 border border-[#ddd] rounded-xl text-sm text-[#222] focus:outline-none focus:border-[#222] transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
