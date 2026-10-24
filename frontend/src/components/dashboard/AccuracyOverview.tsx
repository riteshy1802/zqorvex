import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyAccuracyRecord } from "../../types/forecast";
import { formatDisplayDate, formatSignedGW } from "../../lib/formatters";

interface AccuracyOverviewProps {
  dailyRecords: DailyAccuracyRecord[];
  isLoading?: boolean;
}

const CustomAccuracyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailyAccuracyRecord = payload[0].payload;
    const isUnder = data.biasGW > 0;

    return (
      <div className="rounded-[2px] border border-border bg-card/98 p-2.5 shadow-2xl backdrop-blur-md">
        <div className="border-b border-border/60 pb-1 font-mono text-xs font-bold text-foreground">
          {formatDisplayDate(data.date)}
        </div>
        <div className="mt-1.5 space-y-1 font-mono text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Daily MAE:</span>
            <span className="font-semibold text-foreground">{data.maeGW.toFixed(2)} GW</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Daily RMSE:</span>
            <span className="font-semibold text-foreground">{data.rmseGW.toFixed(2)} GW</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border/50 pt-1">
            <span className="text-muted-foreground">Daily Bias:</span>
            <span className={`font-bold ${isUnder ? "text-emerald-500" : "text-rose-500"}`}>
              {formatSignedGW(data.biasGW, 2)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[10px] text-muted-foreground">
            <span>Avg Actual:</span>
            <span>{data.actualAvgGW.toFixed(1)} GW</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AccuracyOverview: React.FC<AccuracyOverviewProps> = ({
  dailyRecords,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[360px] w-full animate-pulse rounded-[2px] border border-border bg-card/60 p-5" />
    );
  }

  return (
    <section id="accuracy" className="rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base font-mono">
              January 2026 Historical Daily Error & Bias
            </h2>
            <span className="rounded-[2px] border border-border bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              31 DAYS EVALUATED
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Daily net bias (Actual − Forecast). Positive bars represent days where outturn generation exceeded forecast.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-emerald-500" />
            <span className="text-muted-foreground">Under-forecasted (+Bias)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-rose-500" />
            <span className="text-muted-foreground">Over-forecasted (−Bias)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyRecords}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 2"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.5}
            />

            <XAxis
              dataKey="dayLabel"
              interval={2}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(val: number | string) => `${Number(val) > 0 ? "+" : ""}${val} GW`}
            />

            <ReferenceLine y={0} stroke="var(--border-strong)" strokeWidth={1} />

            <Tooltip content={<CustomAccuracyTooltip />} cursor={{ fill: "var(--border)", opacity: 0.15 }} />

            {/* Completely sharp rectangular bars for institutional terminal aesthetic */}
            <Bar dataKey="biasGW" radius={[0, 0, 0, 0]} maxBarSize={18}>
              {dailyRecords.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.biasGW >= 0 ? "#10b981" : "#f43f5e"}
                  opacity={0.88}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/50 pt-2.5 text-[10px] font-mono text-muted-foreground">
        <span>Historical Error Distribution</span>
        <span>Peak Daily Drift: Jan 17 (+1.42 GW) during Atlantic frontal transition</span>
      </div>
    </section>
  );
};
