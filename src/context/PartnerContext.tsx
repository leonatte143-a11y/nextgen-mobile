import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { partnerService } from '../services/partnerService';
import type { PartnerEarningsSummary, PartnerProfile, PartnerRequest } from '../mock/types';

type PartnerContextValue = {
  profile: PartnerProfile | null;
  requests: PartnerRequest[];
  earnings: PartnerEarningsSummary | null;
  isLoading: boolean;
  refreshPartner: () => Promise<void>;
  toggleOnline: (online: boolean) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  startJob: (requestId: string) => Promise<void>;
  completeJob: (requestId: string) => Promise<void>;
  requestHeavyWorkEstimate: (requestId: string, payload: { extraLabor: number; materialCost: number; description: string }) => Promise<void>;
  declineHeavyWorkEstimate: (requestId: string) => Promise<void>;
  withdrawBalance: () => Promise<void>;
  updateProfile: (payload: Partial<PartnerProfile>) => Promise<void>;
  submitEstimateUpdate: (requestId: string, newAmount: number) => Promise<void>;
  cancelActiveJobWithFee: (requestId: string) => Promise<void>;
};

const PartnerContext = createContext<PartnerContextValue | undefined>(undefined);

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const { partnerToken } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPartner = useCallback(async () => {
    if (!partnerToken) return;
    setIsLoading(true);
    try {
      const [profileResult, requestsResult, earningsResult] = await Promise.allSettled([
        partnerService.getProfile(),
        partnerService.getRequests(),
        partnerService.getEarnings(),
      ]);
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
      if (requestsResult.status === 'fulfilled') setRequests(requestsResult.value);
      if (earningsResult.status === 'fulfilled') setEarnings(earningsResult.value);
    } finally {
      setIsLoading(false);
    }
  }, [partnerToken]);

  useEffect(() => {
    if (!partnerToken) {
      setProfile(null);
      setRequests([]);
      setEarnings(null);
      setIsLoading(false);
      return;
    }
    refreshPartner().catch(() => setIsLoading(false));
  }, [partnerToken, refreshPartner]);

  const toggleOnline = useCallback(
    async (online: boolean) => {
      const updated = await partnerService.toggleOnline(online);
      setProfile(updated);
    },
    [],
  );

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      await partnerService.acceptRequest(requestId);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
    } catch (error) {
      console.warn('Accept request failed', error);
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      await partnerService.rejectRequest(requestId);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
    } catch (error) {
      console.warn('Reject request failed', error);
    }
  }, []);

  const startJob = useCallback(async (requestId: string) => {
    try {
      await partnerService.startJob(requestId);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
    } catch (error) {
      console.warn('Start job failed', error);
    }
  }, []);

  const completeJob = useCallback(async (requestId: string) => {
    try {
      await partnerService.completeJob(requestId);
      const [requestsResult, profileResult, earningsResult] = await Promise.all([
        partnerService.getRequests(),
        partnerService.getProfile(),
        partnerService.getEarnings(),
      ]);
      setRequests(requestsResult);
      setProfile(profileResult);
      setEarnings(earningsResult);
    } catch (error) {
      console.warn('Complete job failed', error);
    }
  }, []);

  const requestHeavyWorkEstimate = useCallback(
    async (requestId: string, payload: { extraLabor: number; materialCost: number; description: string }) => {
      try {
        await partnerService.requestHeavyWorkEstimate(requestId, payload);
        const requestsResult = await partnerService.getRequests();
        setRequests(requestsResult);
      } catch (error) {
        console.warn('Heavy work estimate request failed', error);
      }
    },
    [],
  );

  const declineHeavyWorkEstimate = useCallback(async (requestId: string) => {
    try {
      await partnerService.declineHeavyWorkEstimate(requestId);
      const [requestsResult, profileResult, earningsResult] = await Promise.all([
        partnerService.getRequests(),
        partnerService.getProfile(),
        partnerService.getEarnings(),
      ]);
      setRequests(requestsResult);
      setProfile(profileResult);
      setEarnings(earningsResult);
    } catch (error) {
      console.warn('Decline heavy work estimate failed', error);
    }
  }, []);

  const withdrawBalance = useCallback(async () => {
    try {
      const earningsResult = await partnerService.withdrawBalance();
      setEarnings(earningsResult);
    } catch (error) {
      console.warn('Withdraw balance failed', error);
    }
  }, []);

  const updateProfile = useCallback(async (payload: Partial<PartnerProfile>) => {
    const updated = await partnerService.updateProfile(payload);
    setProfile(updated);
  }, []);

  const submitEstimateUpdate = useCallback(async (requestId: string, newAmount: number) => {
    await partnerService.submitEstimateUpdate(requestId, newAmount);
    const [requestsResult, profileResult, earningsResult] = await Promise.all([
      partnerService.getRequests(),
      partnerService.getProfile(),
      partnerService.getEarnings(),
    ]);
    setRequests(requestsResult);
    setProfile(profileResult);
    setEarnings(earningsResult);
  }, []);

  const cancelActiveJobWithFee = useCallback(async (requestId: string) => {
    await partnerService.cancelActiveJobWithFee(requestId);
    const [requestsResult, profileResult, earningsResult] = await Promise.all([
      partnerService.getRequests(),
      partnerService.getProfile(),
      partnerService.getEarnings(),
    ]);
    setRequests(requestsResult);
    setProfile(profileResult);
    setEarnings(earningsResult);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      requests,
      earnings,
      isLoading,
      refreshPartner,
      toggleOnline,
      acceptRequest,
      rejectRequest,
      startJob,
      completeJob,
      requestHeavyWorkEstimate,
      declineHeavyWorkEstimate,
      withdrawBalance,
      updateProfile,
      submitEstimateUpdate,
      cancelActiveJobWithFee,
    }),
    [
      profile,
      requests,
      earnings,
      isLoading,
      refreshPartner,
      toggleOnline,
      acceptRequest,
      rejectRequest,
      startJob,
      completeJob,
      requestHeavyWorkEstimate,
      declineHeavyWorkEstimate,
      withdrawBalance,
      updateProfile,
      submitEstimateUpdate,
      cancelActiveJobWithFee,
    ],
  );

  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner must be used within PartnerProvider');
  return ctx;
}
