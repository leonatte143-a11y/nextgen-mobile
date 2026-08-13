import type { User, UserProfileUpdate } from '../types/user';
import { coerceUser } from '../types/user';
import { apiService } from './apiService';

export const userService = {
  async getProfile(): Promise<User> {
    const data = await apiService.get<unknown>('/api/v1/users/me', 'user');
    return coerceUser(data);
  },

  async updateProfile(partial: UserProfileUpdate): Promise<User> {
    const data = await apiService.put<unknown>('/api/v1/users/me', partial, 'user');
    return coerceUser(data);
  },

  async deleteAccount(): Promise<void> {
    await apiService.delete('/api/v1/users/me', 'user');
  },

  async toggleFreeze(): Promise<{ isFrozen: boolean }> {
    return apiService.post<{ isFrozen: boolean }>('/api/v1/users/me/freeze', undefined, 'user');
  },
};
