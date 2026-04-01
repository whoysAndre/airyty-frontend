import { apiClient } from './client'
import type { ListingDetail, ListingFilters, ListingsResponse } from '@/types/listing.types'

export interface CreateListingDto {
  title: string
  description: string
  city: string
  country: string
  maxGuests: number
  pricePerNight: number
  images?: File[]
}

export interface UpdateListingDto {
  title?: string
  description?: string
  city?: string
  country?: string
  maxGuests?: number
  pricePerNight?: number
}

export const listingsApi = {
  getAll(filters?: ListingFilters) {
    const params = new URLSearchParams()
    if (filters?.city) params.set('city', filters.city)
    if (filters?.country) params.set('country', filters.country)
    if (filters?.guests) params.set('guests', String(filters.guests))
    if (filters?.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.limit) params.set('limit', String(filters.limit))
    const qs = params.toString()
    return apiClient.get<ListingsResponse>(`/listings${qs ? `?${qs}` : ''}`)
  },

  getById(id: string) {
    return apiClient.get<ListingDetail>(`/listings/${id}`)
  },

  // HOST endpoints
  getMyListings(token: string) {
    return apiClient.get<ListingDetail[]>('/listings/host/my-listings', token)
  },

  create(dto: CreateListingDto, token: string) {
    const form = new FormData()
    form.append('title', dto.title)
    form.append('description', dto.description)
    form.append('city', dto.city)
    form.append('country', dto.country)
    form.append('maxGuests', String(dto.maxGuests))
    form.append('pricePerNight', String(dto.pricePerNight))
    dto.images?.forEach((img) => form.append('images', img))
    return apiClient.postForm<ListingDetail>('/listings', form, token)
  },

  update(id: string, dto: UpdateListingDto, token: string) {
    return apiClient.patch<ListingDetail>(`/listings/${id}`, dto, token)
  },

  addImages(id: string, files: File[], token: string) {
    const form = new FormData()
    files.forEach((f) => form.append('images', f))
    return apiClient.postForm<ListingDetail>(`/listings/${id}/images`, form, token)
  },

  deleteImage(id: string, publicId: string, token: string) {
    return apiClient.delete<{ status: number; message: string }>(`/listings/${id}/images`, { publicId }, token)
  },

  toggleActive(id: string, token: string) {
    return apiClient.patch<ListingDetail>(`/listings/${id}/toggle-active`, {}, token)
  },

  deleteListing(id: string, token: string) {
    return apiClient.delete<{ status: number; message: string }>(`/listings/${id}`, undefined, token)
  },
}
