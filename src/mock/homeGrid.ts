import type { BucketId } from './types';

/** Featured tiles on home — links into catalog */
export interface HomeGridTile {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  bucketId: BucketId;
  serviceId: string;
}

export const HOME_GRID_TILES: HomeGridTile[] = [
  { id: 'hg1', label: 'Electrician', sub: 'Fan Repair', emoji: '⚡', bucketId: 'home_repair', serviceId: 'svc_fan_repair' },
  { id: 'hg2', label: 'Plumber', sub: 'Leakage/Taps', emoji: '🚿', bucketId: 'home_repair', serviceId: 'svc_plumber' },
  { id: 'hg3', label: 'AC Service', sub: 'Filter/Gas', emoji: '❄️', bucketId: 'home_repair', serviceId: 'svc_ac' },
  { id: 'hg4', label: 'Cleaning', sub: 'Full House', emoji: '🧹', bucketId: 'home_services', serviceId: 'svc_cleaning' },
  { id: 'hg5', label: 'House Cleaning', sub: 'Deep clean', emoji: '🏠', bucketId: 'home_services', serviceId: 'svc_cleaning' },
  { id: 'hg6', label: 'Drivers', sub: 'Hourly/Daily', emoji: '🚗', bucketId: 'professional_education', serviceId: 'svc_driver' },
  { id: 'hg7', label: 'RMP Doctors', sub: 'Quick Consult', emoji: '🩺', bucketId: 'life_health', serviceId: 'svc_rmp' },
  { id: 'hg8', label: 'Medicine', sub: '30 Mins', emoji: '💊', bucketId: 'life_health', serviceId: 'svc_medicine' },
  { id: 'hg9', label: 'Photographer', sub: 'Events', emoji: '📷', bucketId: 'events', serviceId: 'svc_photographer' },
];
