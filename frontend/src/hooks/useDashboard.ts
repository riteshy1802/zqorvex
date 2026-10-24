import { useEffect, useState, useCallback } from "react";
import { fetchDashboard } from "../api/dashboard";
import { DashboardResponse } from "../types/dashboard";

export interface UseDashboardResult {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom React hook for fetching dashboard data from the FastAPI backend.
 *
 * Guarantees:
 * - Single request per date change.
 * - Previous pending requests are automatically cancelled via AbortController.
 * - No redundant fetches on re-renders, theme toggling, or UI hover events.
 * - Clean loading and error states compliant with React 19 rules.
 */
export function useDashboard(selectedDate: string): UseDashboardResult {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isCancelled = false;

    fetchDashboard(selectedDate, controller.signal)
      .then((payload) => {
        if (!isCancelled) {
          setData(payload);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Failed to load dashboard data from Elexon API backend";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [selectedDate, refetchTrigger]);

  const isDataStale = !data || data.date !== selectedDate;
  const effectiveLoading = (isLoading && !data) || isDataStale;

  return { data, isLoading: effectiveLoading, error, refetch };
}
