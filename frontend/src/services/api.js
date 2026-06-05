/**
 * API Service — centralized communication layer for the deepfake detection backend
 */

import axios from 'axios';
import { API_BASE_URL, HEALTH_ENDPOINT, PREDICT_ENDPOINT } from '../config/api.config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
});

// ── Response interceptor for consistent error shape ──────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

/**
 * Send an image to the backend for deepfake analysis.
 * @param {File} imageFile
 * @returns {Promise<{ success: boolean, data?: { prediction: string, confidence: number }, error?: string }>}
 */
export const predictImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const { data } = await apiClient.post(PREDICT_ENDPOINT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { success: true, data };
  } catch (err) {
    if (err.response) {
      return {
        success: false,
        error: err.response.data?.detail || `Server error (${err.response.status})`,
        status: err.response.status,
      };
    }
    if (err.request) {
      return {
        success: false,
        error: 'Cannot reach the server. If this is the first request in a while, the backend server may be waking up from sleep mode (Render free tier). This can take up to 60 seconds. Please try again.',
      };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
};

/**
 * Health check — verifies the API and model are ready.
 * @returns {Promise<{ success: boolean, data?: object }>}
 */
export const checkHealth = async () => {
  const cacheBustUrl = `${HEALTH_ENDPOINT}?t=${Date.now()}`;
  const fullUrl = `${API_BASE_URL}${cacheBustUrl}`;
  try {
    const response = await apiClient.get(cacheBustUrl);
    console.log(`[Health Diagnostic] URL: ${fullUrl} | Status: ${response.status} | Payload:`, response.data);
    return { success: true, data: response.data, status: response.status };
  } catch (err) {
    const status = err.response ? err.response.status : 'N/A';
    const payload = err.response ? err.response.data : err.message;
    console.error(`[Health Diagnostic Error] URL: ${fullUrl} | Status: ${status} | Payload:`, payload);
    return { success: false, error: 'Health check failed.', status };
  }
};

export default { predictImage, checkHealth };
