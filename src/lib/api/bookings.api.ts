import { apiClient } from './client'
import type { Booking, BookingStatus, CreateBookingDto } from '@/types/booking.types'

export const bookingsApi = {
  create(dto: CreateBookingDto, token: string) {
    return apiClient.post<Booking>('/bookings', dto, token)
  },

  getMyBookings(token: string) {
    return apiClient.get<Booking[]>('/bookings/my-bookings', token)
  },

  getHostIncoming(token: string) {
    return apiClient.get<Booking[]>('/bookings/host/incoming', token)
  },

  cancel(id: string, token: string) {
    return apiClient.patch<Booking>(`/bookings/${id}/cancel`, {}, token)
  },

  updateStatus(id: string, status: BookingStatus, token: string) {
    return apiClient.patch<Booking>(`/bookings/${id}/status`, { status }, token)
  },
}
