import { MOCK_BOOKINGS } from '../mock/bookings';
import { CATALOG_SERVICES } from '../mock/catalog';
import type { Booking, BookingStatus } from '../mock/types';
import { mockRequest } from './api';

let bookingsStore = [...MOCK_BOOKINGS];

function computeBill(basePrice: number, visitingFee = 30, adminPct = 0.1) {
  const subtotal = basePrice + visitingFee;
  const adminComm = Math.round(subtotal * adminPct);
  return { visitingFee, adminComm, total: subtotal + adminComm };
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return mockRequest(() => [...bookingsStore].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  },

  async getBooking(id: string): Promise<Booking | null> {
    return mockRequest(() => bookingsStore.find((b) => b.id === id) ?? null);
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
    return mockRequest(() => {
      const svc = CATALOG_SERVICES.find((s) => s.id === input.serviceId);
      if (!svc) throw new Error('Service not found');
      const baseForFees = input.amountOverride ?? svc.basePrice;
      const bill = computeBill(baseForFees);
      let total = bill.total;
      if (input.promoCode?.toUpperCase() === 'NEXGEN2026') {
        total = Math.max(0, total - 50);
      }
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      const b: Booking = {
        id: `bk_${Date.now()}`,
        serviceId: svc.id,
        serviceName: input.serviceNameOverride ?? svc.name,
        categoryLabel: svc.categoryLabel,
        partnerName: svc.partner.name,
        partnerRating: svc.partner.rating,
        status: 'partner_assigned',
        totalAmount: total,
        startOtp: otp,
        scheduledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        address: input.address,
        etaMins: 12,
      };
      bookingsStore = [b, ...bookingsStore];
      return b;
    });
  },

  async cancelBooking(id: string): Promise<{ refund: number; fee: number }> {
    return mockRequest(() => {
      const b = bookingsStore.find((x) => x.id === id);
      const fee = 50;
      const refund = b ? Math.max(0, b.totalAmount - fee) : 0;
      bookingsStore = bookingsStore.map((x) =>
        x.id === id ? { ...x, status: 'cancelled' as BookingStatus } : x,
      );
      return { refund, fee };
    });
  },

  async submitReview(bookingId: string, stars: number, tags: string[], note?: string) {
    return mockRequest(() => ({ bookingId, stars, tags, note, pointsEarned: 10 }));
  },
};
