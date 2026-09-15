import type { Ionicons } from '@expo/vector-icons';

/** Shared EXO Marketplace taxonomy used by both the Store category grid and the Post Ad screen. */
export const MARKETPLACE_FIXED_CATEGORIES: { name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Cars', icon: 'car-outline' },
  { name: 'Properties', icon: 'business-outline' },
  { name: 'Mobiles', icon: 'phone-portrait-outline' },
  { name: 'Jobs', icon: 'briefcase-outline' },
  { name: 'Fashion', icon: 'shirt-outline' },
  { name: 'Bikes', icon: 'bicycle-outline' },
  { name: 'Electronics', icon: 'hardware-chip-outline' },
  { name: 'Commercial Vehicles', icon: 'bus-outline' },
  { name: 'Furniture', icon: 'bed-outline' },
  { name: 'Pets', icon: 'paw-outline' },
];
