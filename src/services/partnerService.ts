import { mockRequest } from './api';
import { MOCK_PARTNER_EARNINGS, MOCK_PARTNER_PROFILE, MOCK_PARTNER_REQUESTS } from '../mock/partnerData';
import type { PartnerEarningsSummary, PartnerProfile, PartnerRequest } from '../mock/types';

let activeProfile: PartnerProfile = { ...MOCK_PARTNER_PROFILE };
let activeRequests: PartnerRequest[] = [...MOCK_PARTNER_REQUESTS];
let activeEarnings: PartnerEarningsSummary = { ...MOCK_PARTNER_EARNINGS };

function recalcEarnings() {
  activeEarnings = {
    ...activeEarnings,
    todayEarnings: activeProfile.todayEarnings,
    lifetimeEarnings: activeProfile.lifetimeEarnings,
    availableBalance: activeProfile.walletBalance,
  };
}

export const partnerService = {
  async getProfile(): Promise<PartnerProfile> {
    return mockRequest(() => ({ ...activeProfile }));
  },

  async getRequests(): Promise<PartnerRequest[]> {
    return mockRequest(() => activeRequests.map((request) => ({ ...request })) as PartnerRequest[]);
  },

  async getEarnings(): Promise<PartnerEarningsSummary> {
    return mockRequest(() => ({ ...activeEarnings }));
  },

  async toggleOnline(online: boolean): Promise<PartnerProfile> {
    return mockRequest(() => {
      activeProfile = { ...activeProfile, isOnline: online };
      return { ...activeProfile };
    });
  },

  async acceptRequest(requestId: string): Promise<PartnerRequest> {
    return mockRequest(() => {
      activeRequests = activeRequests.map((request) =>
        request.id === requestId && request.status === 'new'
          ? ({ ...request, status: 'pending' } as PartnerRequest)
          : request,
      );
      return { ...(activeRequests.find((request) => request.id === requestId) as PartnerRequest) };
    });
  },

  async rejectRequest(requestId: string): Promise<PartnerRequest> {
    return mockRequest(() => {
      activeRequests = activeRequests.map((request) =>
        request.id === requestId && request.status === 'new'
          ? ({ ...request, status: 'rejected' } as PartnerRequest)
          : request,
      );
      return { ...(activeRequests.find((request) => request.id === requestId) as PartnerRequest) };
    });
  },

  async startJob(requestId: string): Promise<PartnerRequest> {
    return mockRequest(() => {
      activeRequests = activeRequests.map((request) =>
        request.id === requestId && request.status === 'pending'
          ? ({ ...request, status: 'in_progress' } as PartnerRequest)
          : request,
      );
      return { ...(activeRequests.find((request) => request.id === requestId) as PartnerRequest) };
    });
  },

  async completeJob(requestId: string): Promise<PartnerRequest> {
    return mockRequest(() => {
      const existing = activeRequests.find((request) => request.id === requestId);
      if (!existing) throw new Error('Request not found');
      const updated: PartnerRequest = { ...existing, status: 'completed' };
      activeRequests = activeRequests.map((request) => (request.id === requestId ? updated : request));
      activeProfile = {
        ...activeProfile,
        jobsCompleted: activeProfile.jobsCompleted + 1,
        todayEarnings: activeProfile.todayEarnings + updated.partnerShare,
        lifetimeEarnings: activeProfile.lifetimeEarnings + updated.partnerShare,
        walletBalance: activeProfile.walletBalance + updated.partnerShare,
      };
      recalcEarnings();
      return { ...updated };
    });
  },

  async submitEstimateUpdate(requestId: string, newAmount: number): Promise<PartnerRequest> {
    return mockRequest(() => {
      activeRequests = activeRequests.map((request) =>
        request.id === requestId && (request.status === 'in_progress' || request.status === 'pending')
          ? { ...request, pendingEstimateAmount: newAmount }
          : request,
      );
      return { ...(activeRequests.find((request) => request.id === requestId) as PartnerRequest) };
    });
  },

  async cancelActiveJobWithFee(requestId: string): Promise<PartnerRequest> {
    return mockRequest(() => {
      const current = activeRequests.find((r) => r.id === requestId);
      if (!current || (current.status !== 'pending' && current.status !== 'in_progress')) {
        throw new Error('Cannot cancel this request');
      }
      activeProfile = { ...activeProfile, walletBalance: activeProfile.walletBalance + 50 };
      recalcEarnings();
      activeRequests = activeRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'cancelled' } : r,
      );
      return { ...(activeRequests.find((r) => r.id === requestId) as PartnerRequest) };
    });
  },

  async withdrawBalance(): Promise<PartnerEarningsSummary> {
    return mockRequest(() => {
      activeProfile = { ...activeProfile, walletBalance: 0 };
      activeEarnings = { ...activeEarnings, availableBalance: 0, pendingPayout: 0 };
      return { ...activeEarnings };
    });
  },

  async updateProfile(payload: Partial<PartnerProfile>): Promise<PartnerProfile> {
    return mockRequest(() => {
      activeProfile = { ...activeProfile, ...payload };
      return { ...activeProfile };
    });
  },
};
