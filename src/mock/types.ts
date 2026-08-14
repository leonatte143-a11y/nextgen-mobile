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

export interface PartnerReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface PartnerSummary {
  id: string;
  name: string;
  phone?: string;
  rating: number;
  jobsCompleted: number;
  photoUrl?: string;
  reviewsCount?: number;
  categories?: string[];
  isOnline?: boolean;
  distanceKm?: number;
  /** Photos uploaded by the partner for their public profile (not yet backed by an upload flow). */
  photos?: string[];
  /** Written customer reviews (not yet backed by a review-collection flow). */
  reviews?: PartnerReview[];
  description?: string;
}

export interface ServiceMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
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
  customerPhone?: string;
  notes: string;
  requestedAt: string;
  extraServices?: Array<{ id: string; name: string; price: number }>;
  lineItems?: BookingLineItem[];
  itemsSubtotal?: number;
  /** Mock: updated amount waiting for user approval */
  pendingEstimateAmount?: number;
  heavyWorkEstimate?: HeavyWorkEstimate;
  visitingFee?: number;
  isPartnerArrived?: boolean;
  workDoneRequested?: boolean;
  customRequirements?: string;
  paymentStatus?: 'pending' | 'awaiting_partner_confirmation' | 'paid';
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
  referralCode?: string;
  /** Photos the partner has uploaded for their public profile grid. */
  photos?: string[];
  /** Partner-authored description shown to Users on their profile. */
  description?: string;
}

export type PartnerReferralEarning = {
  id: string;
  bookingId: string;
  amount: number;
  createdAt: string;
};

export type PartnerReferralSummary = {
  referralCode: string;
  totalEarned: number;
  earnings: PartnerReferralEarning[];
};

/** Partner-editable service line (My Services / pricing management) */
export interface PartnerPricingRow {
  id: string;
  serviceName: string;
  category: string;
  baseCost: number;
  isActive: boolean;
  approvalStatus: 'approved' | 'pending_review';
  withinLimits?: boolean;
}

export interface PartnerPriceLimits {
  min: number;
  max: number;
}

export interface PartnerPricingListResponse {
  limits: PartnerPriceLimits;
  items: PartnerPricingRow[];
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

export interface BookingLineItem {
  id?: string;
  serviceItemId?: string | null;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface SelectedBookingItem {
  serviceItemId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryLabel: string;
  partnerName: string;
  partnerRating: number;
  partnerPhone?: string;
  status: BookingStatus;
  totalAmount: number;
  startOtp?: string;
  endOtp?: string;
  scheduledAt: string;
  createdAt: string;
  address: string;
  /** Minutes until arrival when en_route */
  etaMins?: number;
  visitingFee?: number;
  itemsSubtotal?: number;
  promoDiscount?: number;
  distanceKm?: number;
  lineItems?: BookingLineItem[];
  isPartnerArrived?: boolean;
  workDoneRequested?: boolean;
  heavyWorkEstimateRequested?: boolean;
  customRequirements?: string;
  paymentStatus?: 'pending' | 'awaiting_partner_confirmation' | 'paid';
  paymentMethod?: string;
}

export interface VisitingChargeQuote {
  distanceKm: number;
  visitingCharges: number;
  usedFallback?: boolean;
  warning?: string | null;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'offer' | 'health';
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
}

