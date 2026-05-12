import { apiService } from './apiService';
import type { PartnerEarningsSummary, PartnerPricingRow, PartnerProfile, PartnerRequest } from '../mock/types';

export const partnerService = {
  async getProfile(): Promise<PartnerProfile> {
    return apiService.get('/api/v1/partners/profile', 'partner');
  },

  async getRequests(): Promise<PartnerRequest[]> {
    return apiService.get('/api/v1/partners/requests', 'partner');
  },

  async getEarnings(): Promise<PartnerEarningsSummary> {
    return apiService.get('/api/v1/partners/earnings', 'partner');
  },

  async toggleOnline(online: boolean): Promise<PartnerProfile> {
    return apiService.post('/api/v1/partners/online', { online }, 'partner');
  },

  async acceptRequest(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/accept`, {}, 'partner');
  },

  async rejectRequest(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/reject`, {}, 'partner');
  },

  async startJob(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/start`, {}, 'partner');
  },

  async completeJob(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/complete`, {}, 'partner');
  },

  async submitEstimateUpdate(requestId: string, newAmount: number): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/estimate`, { newAmount }, 'partner');
  },

  async cancelActiveJobWithFee(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/cancel-fee`, {}, 'partner');
  },

  async requestHeavyWorkEstimate(
    requestId: string,
    details: { extraLabor: number; materialCost: number; description: string },
  ): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/heavy-estimate`, details, 'partner');
  },

  async declineHeavyWorkEstimate(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/decline-heavy`, {}, 'partner');
  },

  async withdrawBalance(): Promise<PartnerEarningsSummary> {
    return apiService.post('/api/v1/partners/withdraw', {}, 'partner');
  },

  async updateProfile(payload: Partial<PartnerProfile>): Promise<PartnerProfile> {
    return apiService.put('/api/v1/partners/profile', payload, 'partner');
  },

  async getPricingRows(): Promise<PartnerPricingRow[]> {
    return apiService.get('/api/v1/partners/pricing', 'partner');
  },

  async updatePricingBase(id: string, baseCost: number): Promise<PartnerPricingRow[]> {
    return apiService.put(`/api/v1/partners/pricing/${id}`, { baseCost }, 'partner');
  },

  async addPricingRow(serviceName: string, category: string, baseCost: number): Promise<PartnerPricingRow[]> {
    return apiService.post('/api/v1/partners/pricing', { serviceName, category, baseCost }, 'partner');
  },
};
