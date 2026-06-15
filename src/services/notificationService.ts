import type { AppNotification } from '../mock/types';
import { apiService } from './apiService';

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    return apiService.get('/api/v1/notifications', 'user');
  },

  async markAllRead(): Promise<void> {
    await apiService.post('/api/v1/notifications/read-all', {}, 'user');
  },

  async markRead(id: string): Promise<AppNotification> {
    return apiService.post(`/api/v1/notifications/${id}/read`, {}, 'user');
  },
};
