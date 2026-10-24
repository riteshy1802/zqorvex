import React from "react";
import { Clock, Radio, Zap } from "lucide-react";
import { DeliverySelector } from "./DeliverySelector";
import { formatDisplayDate } from "../../lib/formatters";

interface HeroSectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  latestPublishTime: string;
  latestForecastGW: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedDate,
  onSelectDate,
  latestPublishTime,
  latestForecastGW,
}) => {
  return (
    <section id="overview" className="relative pt-6 pb-8 md:pt-10 md:pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: Product title & Decision purpose */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Energy Trading Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Wind Forecast Intelligence
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Understand the latest national wind generation forecast and quantify how reliable it has been
            across British Transmission System settlement periods.
          </p>
        </div>

        {/* Right: Date selector & Delivery context pill */}
        <div className="flex flex-col gap-3 sm:items-start lg:items-end">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery Date Selection
          </span>
          <DeliverySelector selectedDate={selectedDate} onSelectDate={onSelectDate} />
        </div>
      </div>

      {/* Decision Context Strip */}
      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3 sm:gap-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Delivery Period
            </div>
            <div className="text-sm font-bold font-mono text-foreground sm:text-base">
              {formatDisplayDate(selectedDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Latest Forecast Published
            </div>
            <div className="text-sm font-bold font-mono text-foreground sm:text-base">
              {latestPublishTime}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Latest Forecast Volume
            </div>
            <div className="text-sm font-bold font-mono text-foreground sm:text-base">
              {latestForecastGW.toFixed(1)} GW
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
