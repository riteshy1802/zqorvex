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
import { DailyAccuracy } from "../../types/dashboard";
import {
  formatDayMonth,
  formatDisplayDate,
  formatGW,
  formatMW,
  formatSignedGW,
  formatSignedMW,
} from "../../lib/formatters";

interface AccuracyOverviewProps {
  dailyRecords: DailyAccuracy[];
  isLoading?: boolean;
}

interface DailyChartItem extends DailyAccuracy {
  dayLabel: string;
  biasGW: number;
  maeGW: number;
  rmseGW: number;
}

interface TooltipPayloadItem {
  payload: DailyChartItem;
}

interface CustomAccuracyTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomAccuracyTooltip = ({ active, payload }: CustomAccuracyTooltipProps) => {
  if (active && payload && payload.length) {
    const data: DailyChartItem = payload[0].payload;
    const isOver = data.bias > 0;
    const isUnder = data.bias < 0;

    return (
      <div className="rounded-[2px] border border-border bg-card/98 p-2.5 shadow-2xl backdrop-blur-md">
        <div className="border-b border-border/60 pb-1 font-mono text-xs font-bold text-foreground">
          {formatDisplayDate(data.date)}
        </div>
        <div className="mt-1.5 space-y-1 font-mono text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Daily MAE:</span>
            <span className="font-semibold text-foreground">
              {formatGW(data.mae, 2)} ({formatMW(data.mae)})
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Daily RMSE:</span>
            <span className="font-semibold text-foreground">
              {formatGW(data.rmse, 2)} ({formatMW(data.rmse)})
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border/50 pt-1">
            <span className="text-muted-foreground">Daily Bias:</span>
            <span className={`font-bold ${isOver ? "text-rose-500" : isUnder ? "text-emerald-500" : "text-muted-foreground"}`}>
              {formatSignedGW(data.biasGW, 2)} ({formatSignedMW(data.bias)})
            </span>
          </div>
          <div className="flex justify-between gap-4 text-[10px] text-muted-foreground">
            <span>Tendency:</span>
            <span className={isOver ? "text-rose-400 font-semibold" : isUnder ? "text-emerald-400 font-semibold" : ""}>
              {isOver ? "Over-forecasted (Fct > Act)" : isUnder ? "Under-forecasted (Fct < Act)" : "Unbiased"}
            </span>
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

  const chartData: DailyChartItem[] = dailyRecords.map((d) => ({
    ...d,
    dayLabel: formatDayMonth(d.date),
    biasGW: Math.round((d.bias / 1000) * 100) / 100,
    maeGW: Math.round((d.mae / 1000) * 100) / 100,
    rmseGW: Math.round((d.rmse / 1000) * 100) / 100,
  }));

  // Identify peak absolute drift day dynamically
  let peakDrift = { date: "", bias: 0, absBias: -1 };
  dailyRecords.forEach((d) => {
    if (Math.abs(d.bias) > peakDrift.absBias) {
      peakDrift = { date: d.date, bias: d.bias, absBias: Math.abs(d.bias) };
    }
  });

  return (
    <section id="accuracy" className="rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base font-mono">
              January 2026 Historical Daily Error & Bias
            </h2>
            <span className="rounded-[2px] border border-border bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              {dailyRecords.length} DAYS EVALUATED
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Daily net bias (Forecast − Actual). Positive bars represent days where day-ahead forecast exceeded actual outturn.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-rose-500" />
            <span className="text-muted-foreground">Over-forecasted (+Bias)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-emerald-500" />
            <span className="text-muted-foreground">Under-forecasted (−Bias)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-[270px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.biasGW >= 0 ? "#f43f5e" : "#10b981"}
                  opacity={0.88}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/50 pt-2.5 text-[10px] font-mono text-muted-foreground">
        <span>Historical Error Distribution across January 2026</span>
        {peakDrift.date && (
          <span>
            Peak Daily Drift: {formatDisplayDate(peakDrift.date)} ({formatSignedGW(peakDrift.bias / 1000, 2)})
          </span>
        )}
      </div>
    </section>
  );
};
