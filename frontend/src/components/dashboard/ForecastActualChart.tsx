import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HalfHourRecord } from "../../types/forecast";
import { formatDisplayDate, formatMW, formatSignedMW } from "../../lib/formatters";

interface ForecastActualChartProps {
  records: HalfHourRecord[];
  selectedDate: string;
  isLoading?: boolean;
}

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: HalfHourRecord = payload[0].payload;
    const isUnder = (data.errorMW ?? 0) > 0;

    return (
      <div className="rounded-lg border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {formatDisplayDate(data.targetDate)} · Period {data.period}
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {data.startTime} UTC
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Forecast (WINDFOR):
            </span>
            <span className="font-semibold text-foreground">
              {formatMW(data.forecastMW)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-white" />
              Actual (FUELHH):
            </span>
            <span className="font-semibold text-foreground">
              {formatMW(data.actualMW)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-1.5">
            <span className="text-muted-foreground">Error (Actual − Forecast):</span>
            <span
              className={`font-bold ${
                isUnder ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {formatSignedMW(data.errorMW)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ForecastActualChart: React.FC<ForecastActualChartProps> = ({
  records,
  selectedDate,
  isLoading = false,
}) => {
  const [hoveredPeriod, setHoveredPeriod] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-[440px] w-full animate-pulse rounded-xl border border-border bg-card/60 p-6" />
    );
  }

  // Find max generation to scale Y axis comfortably
  const maxMW = Math.max(
    ...records.map((r) => Math.max(r.forecastMW, r.actualMW || 0)),
    20000
  );
  const yDomainMax = Math.ceil((maxMW + 2000) / 5000) * 5000;

  return (
    <section id="forecast" className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Forecast vs Actual
            </h2>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-medium text-primary border border-primary/20">
              30-min Settlement Periods
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            National wind generation outturn compared with day-ahead and intraday Elexon forecasts.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/20" />
            <span className="text-muted-foreground">
              Forecast <span className="font-mono text-[10px] text-muted-foreground/70">(WINDFOR)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white ring-2 ring-white/20" />
            <span className="text-muted-foreground">
              Actual <span className="font-mono text-[10px] text-muted-foreground/70">(FUELHH)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="mt-6 h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={records}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e?.activePayload && e.activePayload.length) {
                setHoveredPeriod(e.activePayload[0].payload.period);
              }
            }}
            onMouseLeave={() => setHoveredPeriod(null)}
          >
            <defs>
              {/* Cyan gradient for Forecast */}
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="90%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>

              {/* Slate/White gradient for Actual */}
              <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.08} />
                <stop offset="90%" stopColor="currentColor" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="startTime"
              interval={5} // Every 3 hours (6 periods)
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickFormatter={(val: any) => `${val}`}
            />

            <YAxis
              domain={[0, yDomainMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickFormatter={(val: any) => `${(Number(val) / 1000).toFixed(0)} GW`}
            />

            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{
                stroke: "var(--border-strong)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {/* Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecastMW"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#forecastFill)"
              isAnimationActive={true}
              animationDuration={400}
            />

            {/* Actual Line / Area */}
            <Area
              type="monotone"
              dataKey="actualMW"
              stroke="var(--color-chart-actual)"
              strokeWidth={2}
              fill="url(#actualFill)"
              isAnimationActive={true}
              animationDuration={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Settlement Period Status Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Resolution: <span className="font-mono text-foreground">30 min (48 settlement periods)</span></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Coverage: <span className="font-mono text-foreground">100% of National Grid</span></span>
        </div>
        <div className="font-mono">
          {hoveredPeriod ? `Hovering Settlement Period ${hoveredPeriod} of 48` : `Selected: ${formatDisplayDate(selectedDate)}`}
        </div>
      </div>
    </section>
  );
};
