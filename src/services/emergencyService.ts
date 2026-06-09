import { apiService } from './apiService';

export type EmergencyResponse = {
  id: string;
  dispatchPhone: string;
  telUrl: string;
  latitude?: number;
  longitude?: number;
};

export const emergencyService = {
  async triggerSos(coords: { latitude: number; longitude: number }): Promise<EmergencyResponse> {
    return apiService.post<EmergencyResponse>('/api/v1/users/emergency', coords, 'user');
  },
};
