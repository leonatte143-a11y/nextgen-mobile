import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { partnerService } from '../services/partnerService';
import type { PartnerEarningsSummary, PartnerProfile, PartnerRequest } from '../mock/types';

type PartnerContextValue = {
  profile: PartnerProfile | null;
  requests: PartnerRequest[];
  earnings: PartnerEarningsSummary | null;
  isLoading: boolean;
  incomingLead: PartnerRequest | null;
  refreshPartner: () => Promise<void>;
  dismissIncomingLead: () => void;
  toggleOnline: (online: boolean) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  markArrived: (requestId: string) => Promise<boolean>;
  markWorkDone: (requestId: string) => Promise<boolean>;
  completeJob: (requestId: string, otp: string) => Promise<boolean>;
  requestHeavyWorkEstimate: (requestId: string, payload: { extraLabor: number; materialCost: number; description: string }) => Promise<void>;
  declineHeavyWorkEstimate: (requestId: string) => Promise<void>;
  withdrawBalance: () => Promise<void>;
  updateProfile: (payload: Partial<PartnerProfile>) => Promise<void>;
  submitEstimateUpdate: (requestId: string, newAmount: number) => Promise<void>;
  cancelActiveJobWithFee: (requestId: string, reason: string) => Promise<void>;
};

const PartnerContext = createContext<PartnerContextValue | undefined>(undefined);

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const { partnerToken } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [incomingLead, setIncomingLead] = useState<PartnerRequest | null>(null);
  const knownRequestIdsRef = useRef<Set<string>>(new Set());
  const requestsInitializedRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);
  const isOnlineRef = useRef(false);

  const dismissIncomingLead = useCallback(() => setIncomingLead(null), []);

  const refreshPartner = useCallback(async (opts?: { background?: boolean }) => {
    if (!partnerToken) return;
    const silent = opts?.background || hasLoadedOnceRef.current;
    if (!silent) setIsLoading(true);
    try {
      const [profileResult, requestsResult, earningsResult] = await Promise.allSettled([
        partnerService.getProfile(),
        partnerService.getRequests(),
        partnerService.getEarnings(),
      ]);
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
        isOnlineRef.current = profileResult.value.isOnline;
      }
      if (requestsResult.status === 'fulfilled') {
        const nextRequests = requestsResult.value;
        if (requestsInitializedRef.current) {
          const fresh = nextRequests.filter(
            (r) => r.status === 'new' && !knownRequestIdsRef.current.has(r.id),
          );
          if (fresh.length > 0) setIncomingLead(fresh[0]);
        }
        nextRequests.forEach((r) => knownRequestIdsRef.current.add(r.id));
        requestsInitializedRef.current = true;
        setRequests(nextRequests);
      }
      if (earningsResult.status === 'fulfilled') setEarnings(earningsResult.value);
    } finally {
      hasLoadedOnceRef.current = true;
      setIsLoading(false);
    }
  }, [partnerToken]);

  useEffect(() => {
    if (!partnerToken) {
      setProfile(null);
      setRequests([]);
      setEarnings(null);
      setIncomingLead(null);
      knownRequestIdsRef.current = new Set();
      requestsInitializedRef.current = false;
      hasLoadedOnceRef.current = false;
      isOnlineRef.current = false;
      setIsLoading(false);
      return;
    }
    refreshPartner().catch(() => setIsLoading(false));
  }, [partnerToken, refreshPartner]);

  useEffect(() => {
    if (!partnerToken) return;
    const pollMs = profile?.isOnline ? 3000 : 15000;
    const timer = setInterval(() => {
      refreshPartner({ background: true }).catch(() => undefined);
    }, pollMs);
    return () => clearInterval(timer);
  }, [partnerToken, refreshPartner, profile?.isOnline]);

  const toggleOnline = useCallback(
    async (online: boolean) => {
      const updated = await partnerService.toggleOnline(online);
      isOnlineRef.current = updated.isOnline;
      setProfile(updated);
    },
    [],
  );

  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      await partnerService.acceptRequest(requestId);
      setIncomingLead(null);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
    } catch (error) {
      console.warn('Accept request failed', error);
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      await partnerService.rejectRequest(requestId);
      setIncomingLead(null);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
    } catch (error) {
      console.warn('Reject request failed', error);
    }
  }, []);

  const markArrived = useCallback(async (requestId: string) => {
    try {
      await partnerService.markArrived(requestId);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
      return true;
    } catch (error) {
      console.warn('Mark arrived failed', error);
      return false;
    }
  }, []);

  const markWorkDone = useCallback(async (requestId: string) => {
    try {
      await partnerService.markWorkDone(requestId);
      const requestsResult = await partnerService.getRequests();
      setRequests(requestsResult);
      return true;
    } catch (error) {
      console.warn('Mark work done failed', error);
      return false;
    }
  }, []);

  const completeJob = useCallback(async (requestId: string, otp: string) => {
    try {
      await partnerService.completeJob(requestId, otp);
      const [requestsResult, profileResult, earningsResult] = await Promise.all([
        partnerService.getRequests(),
        partnerService.getProfile(),
        partnerService.getEarnings(),
      ]);
      setRequests(requestsResult);
      setProfile(profileResult);
      setEarnings(earningsResult);
      return true;
    } catch (error) {
      console.warn('Complete job failed', error);
      return false;
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

  const cancelActiveJobWithFee = useCallback(async (requestId: string, reason: string) => {
    await partnerService.cancelActiveJobWithFee(requestId, reason);
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
      incomingLead,
      refreshPartner,
      dismissIncomingLead,
      toggleOnline,
      acceptRequest,
      rejectRequest,
      markArrived,
      markWorkDone,
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
      incomingLead,
      refreshPartner,
      dismissIncomingLead,
      toggleOnline,
      acceptRequest,
      rejectRequest,
      markArrived,
      markWorkDone,
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
