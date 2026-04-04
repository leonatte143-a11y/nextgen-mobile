import { DEFAULT_MOCK_USER } from '../mock/defaultUser';
import type { MockUser } from '../mock/types';
import { mockRequest } from './api';

let profile: MockUser = { ...DEFAULT_MOCK_USER };

export const userService = {
  async getProfile(): Promise<MockUser> {
    return mockRequest(() => ({ ...profile }));
  },

  async updateProfile(partial: Partial<MockUser>): Promise<MockUser> {
    return mockRequest(() => {
      profile = { ...profile, ...partial };
      return { ...profile };
    });
  },
};
