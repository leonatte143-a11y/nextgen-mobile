import { MOCK_NOTIFICATIONS } from '../mock/notifications';
import type { AppNotification } from '../mock/types';
import { mockRequest } from './api';

let list = [...MOCK_NOTIFICATIONS];

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    return mockRequest(() => [...list]);
  },

  async markAllRead(): Promise<void> {
    await mockRequest(() => {
      list = list.map((n) => ({ ...n, read: true }));
      return true;
    });
  },
};
