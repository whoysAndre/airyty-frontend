export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingListing {
  id: string
  title: string
  city: string
  country: string
  pricePerNight: string
  hostId: string
  images?: { url: string; public_id: string }[]
}

export interface Booking {
  id: string
  guestId: string
  listingId: string
  checkIn: string
  checkOut: string
  guestCount: number
  totalPrice: string
  status: BookingStatus
  createdAt: string
  listing: BookingListing
}

export interface CreateBookingDto {
  listingId: string
  checkIn: string
  checkOut: string
  guestCount: number
}
