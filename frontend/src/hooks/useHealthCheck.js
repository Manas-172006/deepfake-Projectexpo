/**
 * useHealthCheck — polls /api/health and returns a structured status object.
 *
 * Returns one of:
 *   'checking'  — initial state, first request in flight
 *   'online'    — backend up, model loaded
 *   'degraded'  — backend up, model NOT loaded (or Gemini down)
 *   'offline'   — cannot reach backend
 */

import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';

export const useHealthCheck = (intervalMs = 30000) => {
  const [status,  setStatus]  = useState('checking');
  const [details, setDetails] = useState(null);   // raw health payload

  const ping = useCallback(async () => {
    try {
      const res = await checkHealth();
      if (!res.success) {
        setStatus('offline');
        setDetails(null);
        return;
      }

      const data = res.data;
      setDetails(data);

      if (data?.model_loaded) {
        setStatus('online');
      } else {
        // Backend is reachable but model failed to load
        setStatus('degraded');
      }
    } catch {
      setStatus('offline');
      setDetails(null);
    }
  }, []);

  useEffect(() => {
    ping();
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [ping, intervalMs]);

  return { status, details };
};
