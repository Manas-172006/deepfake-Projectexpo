/**
 * API Service — centralized communication layer for the deepfake detection backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

    const { data } = await apiClient.post('/api/predict', formData, {
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
        error: 'Cannot reach the server. Make sure the backend is running on port 8000.',
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
  try {
    const { data } = await apiClient.get('/api/health');
    return { success: true, data };
  } catch {
    return { success: false, error: 'Health check failed.' };
  }
};

export default { predictImage, checkHealth };
