'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { listingsApi } from '@/lib/api/listings.api'
import { ListingCard } from '@/shared/components/listings/ListingCard'
import { ListingSkeleton } from '@/shared/components/listings/ListingSkeleton'
import { ListingFilters } from '@/shared/components/listings/ListingFilters'
import type { Listing, ListingFilters as Filters, ListingsMeta } from '@/types/listing.types'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [meta, setMeta] = useState<ListingsMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const currentFilters: Filters = {
    city: searchParams.get('city') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  }

  useEffect(() => {
    setLoading(true)
    setFetchError(false)
    listingsApi
      .getAll(currentFilters)
      .then((data) => {
        setListings(data.data)
        setMeta(data.meta)
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const handleFilter = (filters: Filters) => {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.country) params.set('country', filters.country)
    if (filters.guests && filters.guests > 1) params.set('guests', String(filters.guests))
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    if (filters.page && filters.page > 1) params.set('page', String(filters.page))
    const qs = params.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  const currentPage = currentFilters.page ?? 1
  const totalPages = meta?.totalPages ?? 1
  const hasActiveFilters =
    currentFilters.city ||
    currentFilters.country ||
    currentFilters.guests ||
    currentFilters.minPrice ||
    currentFilters.maxPrice

  return (
    <>
      <ListingFilters filters={currentFilters} onFilter={handleFilter} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        {!loading && !fetchError && (meta?.total ?? 0) > 0 && (
          <p className="text-[#222] font-semibold mb-6 animate-fadeIn">
            {meta!.total.toLocaleString()} place{meta!.total !== 1 ? 's' : ''}
            {currentFilters.city ? ` in ${currentFilters.city}` : ''}
            {currentFilters.country ? `, ${currentFilters.country}` : ''}
          </p>
        )}

        {!loading && !fetchError && !hasActiveFilters && listings.length > 0 && (
          <p className="text-[#222] font-semibold mb-6">Explore nearby stays</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ListingSkeleton key={i} />)
            : listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
        </div>

        {/* Empty state */}
        {!loading && !fetchError && listings.length === 0 && (
          <div className="text-center py-24 animate-fadeIn">
            <div className="text-6xl mb-5 select-none">🔍</div>
            <h3 className="text-xl font-bold text-[#222] mb-2">No places found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search filters</p>
            <button
              onClick={() => handleFilter({ page: 1 })}
              className="px-6 py-2.5 rounded-full border-2 border-[#222] text-[#222] text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Error state */}
        {fetchError && (
          <div className="text-center py-24 animate-fadeIn">
            <div className="text-6xl mb-5 select-none">⚡</div>
            <h3 className="text-xl font-bold text-[#222] mb-2">Could not load listings</h3>
            <p className="text-gray-500 text-sm">Make sure the backend is running on port 3000</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !fetchError && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-14">
            <button
              disabled={currentPage <= 1}
              onClick={() => handleFilter({ ...currentFilters, page: currentPage - 1 })}
              className="px-5 py-2.5 rounded-full border border-[#ddd] text-sm font-medium text-[#222] hover:border-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="text-gray-400 px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handleFilter({ ...currentFilters, page: p as number })}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-[#222] text-white'
                        : 'border border-[#ddd] text-[#222] hover:border-[#222]'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handleFilter({ ...currentFilters, page: currentPage + 1 })}
              className="px-5 py-2.5 rounded-full border border-[#ddd] text-sm font-medium text-[#222] hover:border-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
