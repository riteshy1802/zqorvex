import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DataQuality as DataQualityType } from "../../types/dashboard";

interface DataQualityProps {
  stats: DataQualityType | null;
  isLoading?: boolean;
}

export const DataQuality: React.FC<DataQualityProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="h-40 w-full animate-pulse rounded-[2px] border border-border bg-card/60 p-5" />
    );
  }

  // 744 native hourly delivery windows in a 31-day month
  const totalHourlyPeriods = 31 * 24; // 744
  const completeness = ((stats.matched_records / totalHourlyPeriods) * 100).toFixed(1);

  return (
    <section id="data-quality" className="rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base font-mono">
            Data Quality & Pipeline Integrity
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-[2px] bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-500 border border-emerald-500/25">
            <CheckCircle2 className="h-3 w-3" />
            Audit Validated ({completeness}% Matched)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Data Source
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            Elexon BMRS
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Actuals Feed
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            FUELHH Stream
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Forecast Feed
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            WINDFOR Stream
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Eval Resolution
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            Hourly Native
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Matched Periods
          </span>
          <div className="font-mono text-xs font-semibold text-emerald-500">
            {stats.matched_records.toLocaleString()} / {totalHourlyPeriods.toLocaleString()}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Missing Actuals
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.missing_actuals}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Half-Hour Gaps
          </span>
          <div className="font-mono text-xs font-semibold text-amber-500" title="FUELHH :30 periods without WINDFOR counterpart">
            {stats.missing_forecasts} (:30 native)
          </div>
        </div>
      </div>
    </section>
  );
};
