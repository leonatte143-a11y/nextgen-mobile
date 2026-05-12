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

export type PartnerRequestStatus =
  | 'new'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type HeavyWorkEstimateStatus = 'pending_user_approval' | 'approved' | 'declined';

export interface HeavyWorkEstimate {
  extraLabor: number;
  materialCost: number;
  totalExtra: number;
  description: string;
  requestedAt: string;
  status: HeavyWorkEstimateStatus;
}

export interface PartnerRequest {
  id: string;
  serviceName: string;
  category: string;
  customerName: string;
  address: string;
  distanceKm: number;
  scheduledAt: string;
  status: PartnerRequestStatus;
  amount: number;
  commission: number;
  partnerShare: number;
  startOtp: string;
  notes: string;
  requestedAt: string;
  extraServices?: Array<{ id: string; name: string; price: number }>;
  /** Mock: updated amount waiting for user approval */
  pendingEstimateAmount?: number;
  heavyWorkEstimate?: HeavyWorkEstimate;
  visitingFee?: number;
  isPartnerArrived?: boolean;
}

export interface PartnerProfile {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  jobsCompleted: number;
  isOnline: boolean;
  skills: string[];
  categories: string[];
  walletBalance: number;
  todayEarnings: number;
  lifetimeEarnings: number;
  bankName: string;
  bankAccount: string;
  verificationStatus: 'Verified' | 'Pending' | 'Needs Review';
  trainingProgress: number;
  badges: string[];
  strikeCount: number;
  /** Service area — partner dashboard location bar */
  primaryCity: string;
  serviceInnerRadiusKm: number;
  serviceOuterRadiusKm: number;
  allowOutOfStation: boolean;
}

/** Partner-editable service line for pricing / commission screen */
export interface PartnerPricingRow {
  id: string;
  serviceName: string;
  category: string;
  baseCost: number;
}

export interface PartnerCustomerReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  timeLabel: string;
}

export interface PartnerEarningsSummary {
  todayEarnings: number;
  lifetimeEarnings: number;
  availableBalance: number;
  totalJobs: number;
  completedJobs: number;
  commissionRate: number;
  pendingPayout: number;
  /** Loyalty points shown on dashboard */
  rewardPoints: number;
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
  visitingFee?: number;
  isPartnerArrived?: boolean;
  heavyWorkEstimateRequested?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'offer' | 'health';
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
}

