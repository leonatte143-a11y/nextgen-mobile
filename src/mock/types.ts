export type BucketId =
  | 'home_services'
  | 'home_repair'
  | 'tech_supply'
  | 'life_health'
  | 'professional_education'
  | 'events';

export interface ServiceBucket {
  id: BucketId;
  nameEn: string;
  nameTe: string;
  emoji: string;
}

export interface PartnerSummary {
  id: string;
  name: string;
  rating: number;
  jobsCompleted: number;
  photoUrl?: string;
}

export interface CatalogService {
  id: string;
  bucketId: BucketId;
  name: string;
  subtext: string;
  categoryLabel: string;
  basePrice: number;
  rating: number;
  reviewsCount: number;
  partner: PartnerSummary;
  distanceKm: number;
  description: string;
}

export type BookingStatus =
  | 'confirmed'
  | 'partner_assigned'
  | 'en_route'
  | 'awaiting_otp'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryLabel: string;
  partnerName: string;
  partnerRating: number;
  status: BookingStatus;
  totalAmount: number;
  startOtp: string;
  scheduledAt: string;
  createdAt: string;
  address: string;
  /** Minutes until arrival when en_route */
  etaMins?: number;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'offer' | 'health';
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
}

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  rewardPoints: number;
  referralCode: string;
}
