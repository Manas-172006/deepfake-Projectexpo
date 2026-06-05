/**
 * API Configuration single source of truth - FakeProof Labs
 * IMPORTANT: VITE_API_URL environment variable must be set in production (Vercel/Render)
 * Leave empty string as fallback to force explicit configuration in deployment
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const HEALTH_ENDPOINT = '/api/health';
export const PREDICT_ENDPOINT = '/api/predict';

export default {
  API_BASE_URL,
  HEALTH_ENDPOINT,
  PREDICT_ENDPOINT,
};
