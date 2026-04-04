/**
 * Mock API layer — swap `mockRequest` calls for real fetch() when backend is ready.
 */
import { delay } from '../utils/delay';

export const MOCK_NETWORK_DELAY_MS = 650;

export async function mockRequest<T>(factory: () => T, ms: number = MOCK_NETWORK_DELAY_MS): Promise<T> {
  await delay(ms);
  return factory();
}

export async function mockRequestVoid(ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> {
  await delay(ms);
}

/** Placeholder for future real HTTP client */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.nexgen.example';
