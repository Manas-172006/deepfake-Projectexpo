/**
 * useHealthCheck — polls /api/health and returns a structured status object.
 *
 * Returns one of:
 *   'checking'  — initial state, first request in flight
 *   'online'    — backend HTTP 200 received (system active)
 *   'offline'   — cannot reach backend or HTTP error
 */

import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';
import { API_BASE_URL, HEALTH_ENDPOINT } from '../config/api.config';

export const useHealthCheck = (intervalMs = 30000) => {
  const [status,  setStatus]  = useState('checking');
  const [details, setDetails] = useState(null);   // raw health payload

  const ping = useCallback(async () => {
    try {
      const res = await checkHealth();
      const healthUrl = `${API_BASE_URL}${HEALTH_ENDPOINT}`;
      
      if (res.success && res.status === 200) {
        // HTTP 200 received → System is Active (requirement: force online state)
        setStatus('online');
        setDetails(res.data);
        console.log(
          `[Health State] ✅ System Online\n` +
          `  URL: ${healthUrl}\n` +
          `  HTTP Status: ${res.status}\n` +
          `  Backend Status: ${res.data?.status || 'N/A'}\n` +
          `  Model Loaded: ${res.data?.model_loaded || false}\n` +
          `  Computed Connection State: online`
        );
      } else {
        // No success or non-200 status → offline
        setStatus('offline');
        setDetails(null);
        console.error(
          `[Health State] ❌ System Offline\n` +
          `  URL: ${healthUrl}\n` +
          `  HTTP Status: ${res.status || 'N/A'}\n` +
          `  Error: ${res.error || 'Unknown error'}\n` +
          `  Computed Connection State: offline`
        );
      }
    } catch (err) {
      setStatus('offline');
      setDetails(null);
      console.error(
        `[Health State] ❌ System Offline (Exception)\n` +
        `  URL: ${API_BASE_URL}${HEALTH_ENDPOINT}\n` +
        `  Error: ${err.message}\n` +
        `  Computed Connection State: offline`
      );
    }
  }, []);

  useEffect(() => {
    ping();
    const dynamicInterval = status === 'online' ? intervalMs : 5000;
    const id = setInterval(ping, dynamicInterval);
    return () => clearInterval(id);
  }, [ping, intervalMs, status]);

  return { status, details };
};
