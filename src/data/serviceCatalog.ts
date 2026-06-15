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
    icon: 'home-outline',
    subServices: [
      { id: 'hs_clean', title: 'House Cleaning', subtitle: 'Deep & regular', icon: 'sparkles-outline', searchQuery: 'house cleaning' },
      { id: 'hs_paint', title: 'Painters', subtitle: 'Interior & exterior', icon: 'color-palette-outline', searchQuery: 'painter' },
      { id: 'hs_bath', title: 'Bathroom Cleaning', subtitle: 'Sanitization', icon: 'water-outline', searchQuery: 'bathroom cleaning' },
      { id: 'hs_tank', title: 'Water Tank & Sump', subtitle: 'Cleaning', icon: 'beaker-outline', searchQuery: 'water tank' },
      { id: 'hs_pest', title: 'Pest Control', subtitle: 'Safe treatment', icon: 'bug-outline', searchQuery: 'pest control' },
      { id: 'hs_carp', title: 'Carpenter', subtitle: 'Wood works', icon: 'hammer-outline', searchQuery: 'carpenter' },
      { id: 'hs_tiles', title: 'Tiles & Marble', subtitle: 'Flooring workers', icon: 'grid-outline', searchQuery: 'tiles marble' },
      { id: 'hs_glass', title: 'Glass Works', subtitle: 'Panels & fittings', icon: 'albums-outline', searchQuery: 'glass works' },
      { id: 'hs_move', title: 'Packers & Movers', subtitle: 'Relocation', icon: 'car-outline', searchQuery: 'packers movers' },
      { id: 'hs_driver', title: 'Driver', subtitle: 'Car & delivery', icon: 'car-outline', searchQuery: 'driver' },
      { id: 'hs_weld', title: 'Welders', subtitle: 'Metal fabrication', icon: 'flame-outline', searchQuery: 'welder' },
      { id: 'hs_int', title: 'Interior Designers', subtitle: 'Home makeover', icon: 'layers-outline', searchQuery: 'interior designer' },
      { id: 'hs_ceil', title: 'Ceiling Works', subtitle: 'False ceiling', icon: 'resize-outline', searchQuery: 'ceiling' },
      { id: 'hs_gate', title: 'Iron Gate Fabrication', subtitle: 'Gates & grills', icon: 'lock-closed-outline', searchQuery: 'iron gate' },
    ],
  },
  {
    id: 'home_repair',
    bucketId: 'home_repair',
    title: 'Home Repair',
    titleTe: 'ఇంటి మరమ్మతు',
    icon: 'construct-outline',
    subServices: [
      { id: 'hr_elec', title: 'Electrician', subtitle: 'Wiring & switches', icon: 'flash-outline', searchQuery: 'electrician' },
      { id: 'hr_plumb', title: 'Plumber', subtitle: 'Leaks & taps', icon: 'water-outline', searchQuery: 'plumber' },
      { id: 'hr_ac', title: 'AC Repair', subtitle: 'Service & gas fill', icon: 'snow-outline', searchQuery: 'ac repair' },
      { id: 'hr_wm', title: 'Washing Machine', subtitle: 'Repair', icon: 'shirt-outline', searchQuery: 'washing machine' },
      { id: 'hr_cctv', title: 'CCTV Repair', subtitle: 'Install & fix', icon: 'videocam-outline', searchQuery: 'cctv' },
      { id: 'hr_fridge', title: 'Refrigerator', subtitle: 'Repair', icon: 'cube-outline', searchQuery: 'refrigerator' },
      { id: 'hr_ro', title: 'Water Purifier', subtitle: 'RO service', icon: 'funnel-outline', searchQuery: 'water purifier' },
      { id: 'hr_kit', title: 'Kitchen Appliances', subtitle: 'Repair', icon: 'restaurant-outline', searchQuery: 'kitchen appliance' },
      { id: 'hr_tv', title: 'TV Repair & Mount', subtitle: 'Wall mount', icon: 'tv-outline', searchQuery: 'television tv' },
      { id: 'hr_other', title: 'Others', subtitle: 'More repairs', icon: 'ellipsis-horizontal-outline', searchQuery: 'repair' },
    ],
  },
  {
    id: 'professional_education',
    bucketId: 'professional_education',
    title: 'Professionals & Education',
    titleTe: 'వృత్తి & విద్య',
    icon: 'school-outline',
    subServices: [
      { id: 'pe_teacher', title: 'Teachers', subtitle: 'Home tuition', icon: 'book-outline', searchQuery: 'teacher' },
      { id: 'pe_tuition', title: 'Tuition Centres', subtitle: 'Coaching', icon: 'library-outline', searchQuery: 'tuition' },
      { id: 'pe_free', title: 'Freelancers', subtitle: 'Skilled pros', icon: 'briefcase-outline', searchQuery: 'freelancer' },
      { id: 'pe_laptop', title: 'Laptop/PC Repair', subtitle: 'Hardware & OS', icon: 'laptop-outline', searchQuery: 'laptop pc repair' },
      { id: 'pe_wifi', title: 'Wi-Fi Setup', subtitle: 'Network installers', icon: 'wifi-outline', searchQuery: 'wifi network' },
      { id: 'pe_dm', title: 'Digital Marketing', subtitle: 'Freelancers', icon: 'megaphone-outline', searchQuery: 'digital marketing' },
      { id: 'pe_dtp', title: 'Data Entry & DTP', subtitle: 'Operators', icon: 'document-text-outline', searchQuery: 'data entry dtp' },
    ],
  },
  {
    id: 'life_health',
    bucketId: 'life_health',
    title: 'Life & Health',
    titleTe: 'ఆరోగ్యం',
    icon: 'medkit-outline',
    subServices: [
      { id: 'lh_nurse', title: 'Home Nursing', subtitle: 'Patient care', icon: 'heart-outline', searchQuery: 'nursing patient care' },
      { id: 'lh_doc', title: 'Family Doctors', subtitle: 'Home visit', icon: 'medical-outline', searchQuery: 'doctor home visit' },
      { id: 'lh_physio', title: 'Physiotherapists', subtitle: 'Recovery care', icon: 'body-outline', searchQuery: 'physiotherapist' },
      { id: 'lh_lab', title: 'Lab Technicians', subtitle: 'Blood sample', icon: 'flask-outline', searchQuery: 'lab blood sample' },
      { id: 'lh_equip', title: 'Medical Equipment', subtitle: 'Supply & rental', icon: 'fitness-outline', searchQuery: 'medical equipment' },
      { id: 'lh_yoga', title: 'Yoga & Fitness', subtitle: 'Trainers', icon: 'barbell-outline', searchQuery: 'yoga fitness' },
      { id: 'lh_baby', title: 'Baby Sitters', subtitle: 'Nannies', icon: 'happy-outline', searchQuery: 'babysitter nanny' },
      { id: 'lh_astro', title: 'Astrologers', subtitle: 'Vastu experts', icon: 'planet-outline', searchQuery: 'astrologer vastu' },
    ],
  },
  {
    id: 'events',
    bucketId: 'events',
    title: 'Events',
    titleTe: 'కార్యక్రమాలు',
    icon: 'calendar-outline',
    subServices: [
      { id: 'ev_purohit', title: 'Purohit', subtitle: 'Rituals', icon: 'flame-outline', searchQuery: 'purohit' },
      { id: 'ev_sham', title: 'Shamiyana', subtitle: 'Tent setup', icon: 'umbrella-outline', searchQuery: 'shamiyana' },
      { id: 'ev_cat', title: 'Catering Team', subtitle: 'Food service', icon: 'restaurant-outline', searchQuery: 'catering' },
      { id: 'ev_photo', title: 'Photographers', subtitle: 'Events & weddings', icon: 'camera-outline', searchQuery: 'photographer' },
      { id: 'ev_hall', title: 'Wedding Halls', subtitle: 'Venues', icon: 'business-outline', searchQuery: 'wedding hall' },
      { id: 'ev_bridal', title: 'Bridal & Groom', subtitle: 'Services', icon: 'flower-outline', searchQuery: 'bridal groom' },
      { id: 'ev_mehndi', title: 'Mehndi Artist', subtitle: 'Designs', icon: 'color-fill-outline', searchQuery: 'mehndi' },
      { id: 'ev_mgr', title: 'Event Managers', subtitle: 'Stage organizers', icon: 'mic-outline', searchQuery: 'event manager' },
      { id: 'ev_dj', title: 'Sound & DJ', subtitle: 'Systems', icon: 'musical-notes-outline', searchQuery: 'dj sound' },
      { id: 'ev_other', title: 'Other Events', subtitle: 'More services', icon: 'ellipsis-horizontal-outline', searchQuery: 'event' },
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
