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

// Custom Tooltip component with institutional terminal sharpness
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: HalfHourRecord = payload[0].payload;
    const isUnder = (data.errorMW ?? 0) > 0;

    return (
      <div className="rounded-[2px] border border-border bg-card/98 p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-6 border-b border-border/60 pb-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {formatDisplayDate(data.targetDate)} • SP {data.period}
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {data.startTime} UTC
          </span>
        </div>

        <div className="mt-2 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-sky-400" />
              Forecast (WINDFOR):
            </span>
            <span className="font-semibold text-foreground">
              {formatMW(data.forecastMW)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-slate-300 dark:bg-white" />
              Actual (FUELHH):
            </span>
            <span className="font-semibold text-foreground">
              {formatMW(data.actualMW)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-border/50 pt-1.5">
            <span className="text-muted-foreground">Error (Act − Fct):</span>
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
      <div className="h-[430px] w-full animate-pulse rounded-[2px] border border-border bg-card/60 p-6" />
    );
  }

  // Find max generation to scale Y axis comfortably
  const maxMW = Math.max(
    ...records.map((r) => Math.max(r.forecastMW, r.actualMW || 0)),
    20000
  );
  const yDomainMax = Math.ceil((maxMW + 2000) / 5000) * 5000;

  return (
    <section id="forecast" className="rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base font-mono">
              Forecast vs Actual Outturn
            </h2>
            <span className="rounded-[2px] bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground border border-border">
              30-MIN SETTLEMENT PERIODS (SP 01 - 48)
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            National wind generation outturn (FUELHH) evaluated against latest available WINDFOR forecast.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-sky-400" />
            <span className="text-muted-foreground">
              Forecast <span className="text-[10px] text-muted-foreground/70">(WINDFOR)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-slate-900 dark:bg-white" />
            <span className="text-muted-foreground">
              Actual <span className="text-[10px] text-muted-foreground/70">(FUELHH)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="mt-5 h-[370px] w-full">
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
              strokeDasharray="2 2"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="startTime"
              interval={5} // Every 3 hours (6 periods)
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(val: any) => `${val}`}
            />

            <YAxis
              domain={[0, yDomainMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(val: any) => `${(Number(val) / 1000).toFixed(0)} GW`}
            />

            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{
                stroke: "var(--border-strong)",
                strokeWidth: 1,
                strokeDasharray: "2 2",
              }}
            />

            {/* Forecast Area */}
            <Area
              type="monotone"
              dataKey="forecastMW"
              stroke="#38bdf8"
              strokeWidth={1.75}
              fill="url(#forecastFill)"
              isAnimationActive={true}
              animationDuration={300}
            />

            {/* Actual Line / Area */}
            <Area
              type="monotone"
              dataKey="actualMW"
              stroke="var(--color-chart-actual)"
              strokeWidth={1.75}
              fill="url(#actualFill)"
              isAnimationActive={true}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Settlement Period Status Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border/50 pt-2.5 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Resolution: <span className="text-foreground">30 min (48 SPs)</span></span>
          <span>•</span>
          <span>GB National Transmission System</span>
        </div>
        <div>
          {hoveredPeriod ? `Period ${hoveredPeriod.toString().padStart(2, "0")} / 48` : `Date: ${formatDisplayDate(selectedDate)}`}
        </div>
      </div>
    </section>
  );
};
