import { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosConfig";
import type { DashboardStatsDto } from "./dashboardTypes";

interface UseDashboardReturn {
  data: DashboardStatsDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(yearId?: string, startDate?: string, endDate?: string): UseDashboardReturn {
  const [data, setData] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardStatsDto>("/Dashboard/stats", {
        params: { yearId, startDate, endDate }
      });
      setData(res.data);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        if (axiosErr.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError(axiosErr.response?.data?.message ?? "Failed to load dashboard data.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [yearId, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
