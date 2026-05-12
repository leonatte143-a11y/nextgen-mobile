/**
 * API feature flags and re-exports (HTTP client: apiService).
 */
import { BASE_URL, USE_API } from '../config/api';

export { BASE_URL };
export const SHOULD_USE_API = USE_API;
export const API_BASE_URL = BASE_URL;
