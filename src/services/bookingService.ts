import type { Booking, BookingStatus } from '../mock/types';
import { apiService } from './apiService';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return apiService.get('/api/v1/bookings', 'user');
  },

  async getBooking(id: string): Promise<Booking | null> {
    return apiService.get(`/api/v1/bookings/${id}`, 'user');
  },

  async createBooking(input: {
    serviceId: string;
    address: string;
    notes?: string;
    paymentMethod: string;
    promoCode?: string;
    /** When booking from multi-item cart, pass precomputed payable total */
    amountOverride?: number;
    serviceNameOverride?: string;
  }): Promise<Booking> {
    return apiService.post<Booking>('/api/v1/bookings', input, 'user');
  },

  async cancelBooking(id: string): Promise<{ refund: number; fee: number }> {
    return apiService.post(`/api/v1/bookings/${id}/cancel`, {}, 'user');
  },

  async submitReview(bookingId: string, stars: number, tags: string[], note?: string) {
    return apiService.post(`/api/v1/bookings/${bookingId}/review`, { stars, tags, note }, 'user');
  },
};
