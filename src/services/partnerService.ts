import { apiService } from './apiService';
import type {
  PartnerEarningsSummary,
  PartnerPriceLimits,
  PartnerPricingListResponse,
  PartnerPricingRow,
  PartnerProfile,
  PartnerRequest,
} from '../mock/types';

export type PartnerOnboardingPayload = {
  phone: string;
  name: string;
  skills?: string[];
  categories?: string[];
  serviceCategory?: string;
  primaryCity?: string;
  workLocation?: string;
  bankName?: string;
  bankAccount?: string;
  trainingProgress?: number;
};

function unwrapPricingList(data: PartnerPricingListResponse | PartnerPricingRow[]): PartnerPricingListResponse {
  if (Array.isArray(data)) {
    return { limits: { min: 100, max: 1000 }, items: data };
  }
  return {
    limits: data.limits ?? { min: 100, max: 1000 },
    items: data.items ?? [],
  };
}

export const partnerService = {
  async applyOnboarding(payload: PartnerOnboardingPayload): Promise<PartnerProfile> {
    return apiService.post('/api/v1/partners/onboarding', payload);
  },

  async registerPartner(payload: PartnerOnboardingPayload): Promise<PartnerProfile> {
    const data = await apiService.post<{ partner: PartnerProfile; created: boolean }>(
      '/api/v1/auth/partner/register',
      payload,
    );
    return data.partner;
  },

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

  async markArrived(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/arrive`, {}, 'partner');
  },

  async markWorkDone(requestId: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/work-done`, {}, 'partner');
  },

  async startJob(requestId: string, otp: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/start`, { otp }, 'partner');
  },

  async completeJob(requestId: string, otp: string): Promise<PartnerRequest> {
    return apiService.post(`/api/v1/partners/requests/${requestId}/complete`, { otp }, 'partner');
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

  async getPriceLimits(): Promise<PartnerPriceLimits> {
    return apiService.get('/api/v1/partners/pricing/limits', 'partner');
  },

  async getPricingRows(): Promise<PartnerPricingListResponse> {
    const data = await apiService.get<PartnerPricingListResponse | PartnerPricingRow[]>(
      '/api/v1/partners/pricing',
      'partner',
    );
    return unwrapPricingList(data);
  },

  async updatePricingRow(
    id: string,
    patch: Partial<Pick<PartnerPricingRow, 'serviceName' | 'category' | 'baseCost' | 'isActive'>>,
  ): Promise<PartnerPricingListResponse> {
    await apiService.put(`/api/v1/partners/pricing/${id}`, patch, 'partner');
    return this.getPricingRows();
  },

  async addPricingRow(
    serviceName: string,
    category: string,
    baseCost: number,
  ): Promise<{ message?: string; list: PartnerPricingListResponse }> {
    const data = await apiService.post<{ items: PartnerPricingRow[]; item?: PartnerPricingRow }>(
      '/api/v1/partners/pricing',
      { serviceName, category, baseCost },
      'partner',
    );
    const limits = await this.getPriceLimits();
    return {
      list: { limits, items: data.items ?? [] },
    };
  },

  async deletePricingRow(id: string): Promise<PartnerPricingListResponse> {
    const data = await apiService.delete<{ items: PartnerPricingRow[] }>(
      `/api/v1/partners/pricing/${id}`,
      'partner',
    );
    const limits = await this.getPriceLimits();
    return { limits, items: data.items ?? [] };
  },

  /** @deprecated use updatePricingRow */
  async updatePricingBase(id: string, baseCost: number): Promise<PartnerPricingRow[]> {
    const res = await this.updatePricingRow(id, { baseCost });
    return res.items;
  },
};
