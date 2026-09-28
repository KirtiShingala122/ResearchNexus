import { useState, useEffect } from "react";
import apiClient from "../services/api";

/**
 * Custom hook for health-check polling.
 */
export function useHealthCheck() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const { data } = await apiClient.get("/health");
        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { health, loading, error };
}
