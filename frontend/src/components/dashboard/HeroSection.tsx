import React from "react";
import { Clock, Radio, Zap } from "lucide-react";
import { DeliverySelector } from "./DeliverySelector";
import { formatDisplayDate, formatGW } from "../../lib/formatters";

interface HeroSectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dayAheadPublishTime: string;
  dayAheadAvgMW: number;
  dayAheadPeakMW: number;
  latestIntradayAvgMW?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedDate,
  onSelectDate,
  dayAheadPublishTime,
  dayAheadAvgMW,
  dayAheadPeakMW,
  latestIntradayAvgMW,
}) => {
  return (
    <section id="overview" className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12 border-b border-border/60">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: Product title & Decision purpose */}
        <div className="max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-[2px] border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-primary">
            <Radio className="h-3 w-3 text-primary" />
            <span>Energy Trading Intelligence • UK National Grid</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-mono">
            Wind Forecast Intelligence
          </h1>

          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed max-w-xl">
            Decision-support dashboard for UK electricity trading. Monitor latest national wind forecasts against Elexon settlement actuals, track forecast run convergence, and evaluate quantitative bias across January 2026.
          </p>
        </div>

        {/* Right: Date selector & Delivery context pill */}
        <div className="flex flex-col gap-2.5 sm:items-start lg:items-end">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Target Delivery Date
          </span>
          <DeliverySelector selectedDate={selectedDate} onSelectDate={onSelectDate} />
        </div>
      </div>

      {/* Decision Context Strip (Near-sharp corners, breathable institutional layout) */}
      <div className="mt-8 sm:mt-10 grid grid-cols-1 divide-y divide-border/60 border border-border bg-card shadow-sm sm:grid-cols-3 sm:divide-y-0 sm:divide-x rounded-[2px]">
        <div className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-primary/10 text-primary border border-primary/20">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Delivery Period
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-foreground">
              {formatDisplayDate(selectedDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-muted text-muted-foreground border border-border">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Day-Ahead Published Gate
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-foreground">
              {dayAheadPublishTime || "D-1 17:00 UTC"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Radio className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Day-Ahead Forecast (Avg / Peak)
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-foreground">
              {formatGW(dayAheadAvgMW, 2)} <span className="text-xs text-muted-foreground font-normal font-sans">/ {formatGW(dayAheadPeakMW, 2)}</span>
              {latestIntradayAvgMW && (
                <span className="block text-[10px] text-muted-foreground font-mono font-normal">
                  Intraday pre-delivery: {formatGW(latestIntradayAvgMW, 2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
