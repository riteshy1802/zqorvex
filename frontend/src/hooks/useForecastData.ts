import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { DayForecastSummary, EvolutionPoint } from "../types/forecast";

export function useForecastData(selectedDate: string) {
  const [data, setData] = useState<DayForecastSummary | null>(null);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      api.getDeliveryForecast(selectedDate),
      api.getForecastEvolution(selectedDate),
    ])
      .then(([dayData, evoData]) => {
        if (isMounted) {
          setData(dayData);
          setEvolution(evoData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "Failed to load Elexon forecast data");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  return { data, evolution, isLoading, error };
}
