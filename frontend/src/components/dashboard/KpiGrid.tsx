import React from "react";
import { Activity, Gauge, TrendingUp, Wind } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { formatSignedGW } from "../../lib/formatters";

interface KpiGridProps {
  latestForecastGW: number;
  publishTime: string;
  maeGW: number;
  rmseGW: number;
  biasGW: number;
  isLoading?: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  latestForecastGW,
  publishTime,
  maeGW,
  rmseGW,
  biasGW,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-border bg-card/60 p-5"
          />
        ))}
      </div>
    );
  }

  const isUnder = biasGW > 0;
  const biasLabel = isUnder ? "Under-forecasting" : biasGW < 0 ? "Over-forecasting" : "Neutral";
  const biasTrend = isUnder ? "positive" : biasGW < 0 ? "negative" : "neutral";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Latest Forecast */}
      <KpiCard
        label="Latest Forecast"
        value={`${latestForecastGW.toFixed(1)} GW`}
        subValue="Latest available forecast"
        contextTag={`Pub: ${publishTime}`}
        icon={<Wind className="h-4 w-4" />}
      />

      {/* KPI 2: MAE */}
      <KpiCard
        label="MAE (Mean Absolute Error)"
        value={`${maeGW.toFixed(2)} GW`}
        subValue="January 2026"
        contextTag="Delivery day"
        icon={<Activity className="h-4 w-4" />}
      />

      {/* KPI 3: RMSE */}
      <KpiCard
        label="RMSE (Root Mean Square)"
        value={`${rmseGW.toFixed(2)} GW`}
        subValue="January 2026"
        contextTag="Penalizes outliers"
        icon={<Gauge className="h-4 w-4" />}
      />

      {/* KPI 4: Forecast Bias */}
      <KpiCard
        label="Forecast Bias"
        value={formatSignedGW(biasGW, 2)}
        subValue="Actual − Forecast"
        trend={biasTrend}
        trendText={biasLabel}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
};
