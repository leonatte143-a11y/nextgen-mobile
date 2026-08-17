import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { BucketId, CatalogService } from '../mock/types';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type MainCategoryId =
  | 'home_services'
  | 'home_repair'
  | 'professional_education'
  | 'life_health'
  | 'events';

export type SubServiceItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  searchQuery: string;
};

export type MainCategory = {
  id: MainCategoryId;
  bucketId: BucketId;
  title: string;
  titleTe: string;
  icon: IconName;
  subServices: SubServiceItem[];
};

export type PopularServiceSlot = {
  id: string;
  name: string;
  subtitle: string;
  icon: IconName;
  searchTerms: string[];
  fallbackPrice?: number;
  fallbackRating?: number;
};

/** Main categories — order fixed for home grid (3 columns). */
export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'home_services',
    bucketId: 'home_services',
    title: 'Home Services',
    titleTe: 'ఇంటి సేవలు',
    icon: 'home',
    subServices: [
      { id: 'hs_clean', title: 'House Cleaning', subtitle: 'Deep & regular', icon: 'sparkles-outline', searchQuery: 'house cleaning' },
      { id: 'hs_paint', title: 'Painters', subtitle: 'Interior & exterior', icon: 'color-palette-outline', searchQuery: 'painter' },
      { id: 'hs_wood', title: 'Carpenters', subtitle: 'Carpentry', icon: 'hammer-outline', searchQuery: 'wood works carpenter' },
      { id: 'hs_weld', title: 'Welders', subtitle: 'Metal fabrication', icon: 'flame-outline', searchQuery: 'welder' },
      { id: 'hs_ceil', title: 'Ceiling', subtitle: 'False ceiling', icon: 'resize-outline', searchQuery: 'ceiling' },
      { id: 'hs_tiles', title: 'Tiles work', subtitle: 'Flooring & marble', icon: 'grid-outline', searchQuery: 'tiles marble' },
      { id: 'hs_int', title: 'Interior Designing', subtitle: 'Home makeover', icon: 'layers-outline', searchQuery: 'interior designer' },
      { id: 'hs_tank', title: 'Tank Cleaning', subtitle: 'Water tank & sump', icon: 'beaker-outline', searchQuery: 'tank cleaning' },
      { id: 'hs_pest', title: 'Pest Control', subtitle: 'Safe treatment', icon: 'bug-outline', searchQuery: 'pest control' },
      { id: 'hs_garden', title: 'Gardening', subtitle: 'Lawn & plants', icon: 'leaf-outline', searchQuery: 'gardening' },
    ],
  },
  {
    id: 'home_repair',
    bucketId: 'home_repair',
    title: 'Home Repair',
    titleTe: 'ఇంటి మరమ్మతు',
    icon: 'construct-outline',
    subServices: [
      { id: 'hr_elec', title: 'Electrician', subtitle: 'Fan Repair', icon: 'flash-outline', searchQuery: 'electrician' },
      { id: 'hr_plumb', title: 'Plumber', subtitle: 'Leakage/Taps', icon: 'water-outline', searchQuery: 'plumber' },
      { id: 'hr_ac', title: 'AC Service', subtitle: 'Filter/Gas', icon: 'snow-outline', searchQuery: 'ac service' },
      { id: 'hr_kit', title: 'Kitchen Appliance', subtitle: 'Repair & service', icon: 'restaurant-outline', searchQuery: 'kitchen appliance' },
      { id: 'hr_ro', title: 'Water Purifier', subtitle: 'RO service', icon: 'funnel-outline', searchQuery: 'water purifier' },
      { id: 'hr_wm', title: 'Washing Machine', subtitle: 'Repair', icon: 'shirt-outline', searchQuery: 'washing machine' },
      { id: 'hr_fridge', title: 'Fridge Repair', subtitle: 'Refrigerator', icon: 'cube-outline', searchQuery: 'fridge refrigerator' },
      { id: 'hr_tv', title: 'TV Repair', subtitle: 'Wall mount', icon: 'tv-outline', searchQuery: 'television tv' },
    ],
  },
  {
    id: 'professional_education',
    bucketId: 'professional_education',
    title: 'Transport & Professionals',
    titleTe: 'రవాణా & వృత్తి',
    icon: 'school-outline',
    subServices: [
      { id: 'pe_travels', title: 'Car Travels', subtitle: 'Outstation trips', icon: 'car-sport-outline', searchQuery: 'car travels' },
      { id: 'pe_driver', title: 'Drivers', subtitle: 'Hourly/Daily', icon: 'car-outline', searchQuery: 'driver' },
      { id: 'pe_auto', title: 'Auto', subtitle: 'City rides', icon: 'navigate-outline', searchQuery: 'auto driver' },
      { id: 'pe_carmech', title: 'Car Mechanic', subtitle: 'Repair & service', icon: 'build-outline', searchQuery: 'car mechanic' },
      { id: 'pe_bikemech', title: 'Bike Mechanic', subtitle: 'Repair & service', icon: 'bicycle-outline', searchQuery: 'bike mechanic' },
      { id: 'pe_eng', title: 'Engineers', subtitle: 'Technical experts', icon: 'construct-outline', searchQuery: 'engineer' },
      { id: 'pe_super', title: 'Supervisors', subtitle: 'Site management', icon: 'clipboard-outline', searchQuery: 'supervisor' },
      { id: 'pe_teacher', title: 'Teachers', subtitle: 'Tutors/Home Study', icon: 'book-outline', searchQuery: 'teacher tutor' },
    ],
  },
  {
    id: 'life_health',
    bucketId: 'life_health',
    title: 'Health & Care',
    titleTe: 'ఆరోగ్యం',
    icon: 'medkit-outline',
    subServices: [
      { id: 'lh_rmp', title: 'RMP Doctors', subtitle: 'Quick Consult', icon: 'medical-outline', searchQuery: 'rmp doctor' },
      { id: 'lh_diag', title: 'Lab Technician', subtitle: 'Blood Test/Home', icon: 'flask-outline', searchQuery: 'lab technician blood test' },
    ],
  },
  {
    id: 'events',
    bucketId: 'events',
    title: 'Events',
    titleTe: 'కార్యక్రమాలు',
    icon: 'calendar-outline',
    subServices: [
      { id: 'ev_purohit', title: 'Purohith', subtitle: 'Rituals', icon: 'flame-outline', searchQuery: 'purohith' },
      { id: 'ev_photo', title: 'Photographer', subtitle: 'Events & weddings', icon: 'camera-outline', searchQuery: 'photographer' },
      { id: 'ev_sham', title: 'Shamiyana', subtitle: 'Tent setup', icon: 'umbrella-outline', searchQuery: 'shamiyana' },
      { id: 'ev_cat', title: 'Catering', subtitle: 'Food service', icon: 'restaurant-outline', searchQuery: 'catering' },
      { id: 'ev_beauty', title: 'Beauty Service', subtitle: 'Salon at home', icon: 'cut-outline', searchQuery: 'beauty service' },
      { id: 'ev_bridal', title: 'Bride & Groom Makeup', subtitle: 'Bridal services', icon: 'flower-outline', searchQuery: 'bride groom makeup' },
      { id: 'ev_mehandi', title: 'Mehandi Artist', subtitle: 'Designs', icon: 'color-fill-outline', searchQuery: 'mehandi' },
      { id: 'ev_hall', title: 'Wedding Halls', subtitle: 'Venues', icon: 'business-outline', searchQuery: 'wedding hall' },
    ],
  },
];

export const POPULAR_SERVICE_SLOTS: PopularServiceSlot[] = [
  { id: 'pop_plumber', name: 'Plumber', subtitle: 'Leakage & taps', icon: 'water-outline', searchTerms: ['plumber'], fallbackPrice: 300, fallbackRating: 4.7 },
  { id: 'pop_fan', name: 'Fan Repair', subtitle: 'All brands', icon: 'sync-outline', searchTerms: ['fan repair', 'fan'], fallbackPrice: 250, fallbackRating: 4.6 },
  { id: 'pop_elec', name: 'Electrician', subtitle: 'Wiring & MCB', icon: 'flash-outline', searchTerms: ['electrician'], fallbackPrice: 280, fallbackRating: 4.5 },
  { id: 'pop_ac', name: 'AC Repair', subtitle: 'Service & gas', icon: 'snow-outline', searchTerms: ['ac repair', 'ac'], fallbackPrice: 450, fallbackRating: 4.6 },
  { id: 'pop_clean', name: 'House Cleaning', subtitle: 'Deep clean', icon: 'sparkles-outline', searchTerms: ['cleaning', 'house'], fallbackPrice: 499, fallbackRating: 4.8 },
  { id: 'pop_cctv', name: 'CCTV Repair', subtitle: 'Install & fix', icon: 'videocam-outline', searchTerms: ['cctv'], fallbackPrice: 350, fallbackRating: 4.4 },
  { id: 'pop_paint', name: 'Painter', subtitle: 'Interior paint', icon: 'color-palette-outline', searchTerms: ['painter', 'paint'], fallbackPrice: 399, fallbackRating: 4.5 },
  { id: 'pop_ro', name: 'Water Purifier', subtitle: 'RO service', icon: 'funnel-outline', searchTerms: ['purifier', 'ro'], fallbackPrice: 320, fallbackRating: 4.6 },
  { id: 'pop_carp', name: 'Carpenter', subtitle: 'Furniture fix', icon: 'hammer-outline', searchTerms: ['carpenter'], fallbackPrice: 350, fallbackRating: 4.5 },
];

export function getMainCategory(id: MainCategoryId): MainCategory | undefined {
  return MAIN_CATEGORIES.find((c) => c.id === id);
}

export function matchCatalogService(
  catalog: CatalogService[],
  terms: string[],
): CatalogService | undefined {
  const lower = terms.map((t) => t.toLowerCase());
  return catalog.find((s) => {
    const hay = `${s.name} ${s.subtext} ${s.categoryLabel}`.toLowerCase();
    return lower.some((t) => hay.includes(t));
  });
}

export function buildPopularDisplay(
  catalog: CatalogService[],
): Array<PopularServiceSlot & { service?: CatalogService }> {
  return POPULAR_SERVICE_SLOTS.map((slot) => ({
    ...slot,
    service: matchCatalogService(catalog, slot.searchTerms),
  }));
}

export function filterSubServices(
  items: SubServiceItem[],
  query: string,
): SubServiceItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.searchQuery.includes(q),
  );
}
