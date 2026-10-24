import React from "react";
import { Activity, Gauge, TrendingDown, TrendingUp, Wind } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { formatGW, formatMW, formatSignedGW, formatSignedMW } from "../../lib/formatters";

interface KpiGridProps {
  averageForecastMW: number;
  publishTime: string;
  maeMW: number;
  rmseMW: number;
  biasMW: number;
  isLoading?: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  averageForecastMW,
  publishTime,
  maeMW,
  rmseMW,
  biasMW,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[2px] border border-border bg-card/60 p-4"
          />
        ))}
      </div>
    );
  }

  // Authoritative error definition: Error = Forecast - Actual
  // Positive bias (> 0): Over-forecasting (Forecast > Actual)
  // Negative bias (< 0): Under-forecasting (Forecast < Actual)
  const isOver = biasMW > 0;
  const isUnder = biasMW < 0;
  const biasLabel = isOver ? "Over-forecasting" : isUnder ? "Under-forecasting" : "Unbiased";
  const biasTrend = isOver ? "negative" : isUnder ? "positive" : "neutral";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Latest Forecast Volume */}
      <KpiCard
        label="Day-Ahead Forecast Avg"
        value={formatGW(averageForecastMW, 2)}
        subValue={`${formatMW(averageForecastMW)} avg national`}
        contextTag={`Pub: ${publishTime || "D-1 17:00"}`}
        icon={<Wind className="h-3.5 w-3.5" />}
      />

      {/* KPI 2: MAE */}
      <KpiCard
        label="MAE (Mean Absolute Error)"
        value={formatGW(maeMW, 2)}
        subValue={`${formatMW(maeMW)} mean magnitude`}
        contextTag="January 2026"
        icon={<Activity className="h-3.5 w-3.5" />}
      />

      {/* KPI 3: RMSE */}
      <KpiCard
        label="RMSE (Root Mean Square)"
        value={formatGW(rmseMW, 2)}
        subValue={`${formatMW(rmseMW)} outlier penalty`}
        contextTag="Quadratic"
        icon={<Gauge className="h-3.5 w-3.5" />}
      />

      {/* KPI 4: Forecast Bias */}
      <KpiCard
        label="Forecast Bias"
        value={formatSignedGW(biasMW / 1000, 2)}
        subValue={`${formatSignedMW(biasMW)} (Fct − Act)`}
        trend={biasTrend}
        trendText={biasLabel}
        icon={isOver ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      />
    </div>
  );
};
