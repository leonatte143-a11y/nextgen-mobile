import type { AppNotification } from './types';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Phani has accepted your Fan Repair!',
    body: 'View his profile and track live location.',
    timeLabel: '2 mins ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'order',
    title: 'Phani is right outside!',
    body: 'Please have your Start OTP 5821 ready.',
    timeLabel: '8 mins ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'offer',
    title: 'Special Offer for You!',
    body: 'Get 20% off on your next AC Service. Use code: NEX20.',
    timeLabel: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'health',
    title: 'Prescription Ready',
    body: 'Your medicine delivery is confirmed and packed. Track now.',
    timeLabel: '3 days ago',
    read: true,
  },
];
