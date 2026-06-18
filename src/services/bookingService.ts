import type { Booking, BookingStatus, SelectedBookingItem, VisitingChargeQuote } from '../mock/types';
import { apiService } from './apiService';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return apiService.get('/api/v1/bookings', 'user');
  },

  async getBooking(id: string): Promise<Booking | null> {
    return apiService.get(`/api/v1/bookings/${id}`, 'user');
  },

  async quoteVisitingCharge(input: {
    userLat?: number;
    userLng?: number;
    partnerLat?: number;
    partnerLng?: number;
    city?: string;
    partnerId?: string;
  }): Promise<VisitingChargeQuote> {
    return apiService.post<VisitingChargeQuote>(
      '/api/v1/bookings/visiting-charge/quote',
      input,
      'user',
    );
  },

  async createBooking(input: {
    serviceId: string;
    partnerId?: string;
    distanceKm?: number;
    visitingCharges?: number;
    userLat?: number;
    userLng?: number;
    address: string;
    notes?: string;
    customRequirements?: string;
    paymentMethod: string;
    promoCode?: string;
    amountOverride?: number;
    serviceNameOverride?: string;
    selectedItems?: SelectedBookingItem[];
  }): Promise<Booking> {
    return apiService.post<Booking>('/api/v1/bookings', input, 'user');
  },

  async cancelBooking(id: string): Promise<{ refund: number; fee: number }> {
    return apiService.post(`/api/v1/bookings/${id}/cancel`, {}, 'user');
  },

  async confirmPayment(bookingId: string): Promise<Booking> {
    return apiService.post<Booking>(`/api/v1/bookings/${bookingId}/confirm-payment`, {}, 'user');
  },

  async submitReview(bookingId: string, stars: number, tags: string[], note?: string) {
    return apiService.post(`/api/v1/bookings/${bookingId}/review`, { stars, tags, note }, 'user');
  },
};

export type { BookingStatus };
