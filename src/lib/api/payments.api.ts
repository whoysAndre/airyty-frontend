import { apiClient } from './client'
import type { Payment } from '@/types/payment.types'

export const paymentsApi = {
  pay(bookingId: string, token: string) {
    return apiClient.post<Payment>(`/payments/booking/${bookingId}`, {}, token)
  },

  getPayment(bookingId: string, token: string) {
    return apiClient.get<Payment>(`/payments/booking/${bookingId}`, token)
  },

  refund(bookingId: string, token: string) {
    return apiClient.post<Payment>(`/payments/booking/${bookingId}/refund`, {}, token)
  },
}
