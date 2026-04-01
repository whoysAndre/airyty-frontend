export interface ListingImage {
  url: string
  public_id: string
}

export interface ListingHost {
  id: string
  name: string
  avatarUrl?: string
}

export interface Listing {
  id: string
  title: string
  city: string
  country: string
  maxGuests: number
  pricePerNight: string
  images: ListingImage[]
  host: ListingHost
}

export interface ListingDetail extends Listing {
  hostId: string
  description: string
  isActive: boolean
  createdAt: string
}

export interface ListingsMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ListingsResponse {
  data: Listing[]
  meta: ListingsMeta
}

export interface ListingFilters {
  city?: string
  country?: string
  guests?: number
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}
