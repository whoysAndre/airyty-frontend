export type PaymentStatus = 'SUCCEEDED' | 'REFUNDED'

export interface Payment {
  id: string
  bookingId: string
  amount: string
  status: PaymentStatus
  createdAt: string
}
