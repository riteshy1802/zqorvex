import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { AccuracySummaryMetrics, DailyAccuracyRecord, DataQualityStats } from "../types/forecast";

export function useAccuracyMetrics() {
  const [analytics, setAnalytics] = useState<{
    dailyRecords: DailyAccuracyRecord[];
    summary: AccuracySummaryMetrics;
  } | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualityStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([api.getAccuracyAnalytics(), api.getDataQuality()])
      .then(([accuracyData, qualityData]) => {
        if (isMounted) {
          setAnalytics(accuracyData);
          setDataQuality(qualityData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "Failed to load accuracy metrics");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { analytics, dataQuality, isLoading, error };
}
