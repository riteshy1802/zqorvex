import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DataQualityStats } from "../../types/forecast";

interface DataQualityProps {
  stats: DataQualityStats | null;
  isLoading?: boolean;
}

export const DataQuality: React.FC<DataQualityProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="h-44 w-full animate-pulse rounded-xl border border-border bg-card/60 p-6" />
    );
  }

  const completeness = ((stats.matchedPeriods / stats.totalPeriods) * 100).toFixed(1);

  return (
    <section id="data-quality" className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Data Quality & Pipeline Integrity
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Audit Validated ({completeness}% Matched)
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Source
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.source}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Actuals Feed
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.actualsDataset.split(" ")[0]}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Forecast Feed
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.forecastDataset.split(" ")[0]}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Resolution
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.resolution.split(" ")[0]}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Matched Periods
          </span>
          <div className="font-mono text-xs font-semibold text-emerald-500">
            {stats.matchedPeriods.toLocaleString()} / {stats.totalPeriods.toLocaleString()}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Missing Actuals
          </span>
          <div className="font-mono text-xs font-semibold text-foreground">
            {stats.missingActuals}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Missing Forecasts
          </span>
          <div className="font-mono text-xs font-semibold text-amber-500">
            {stats.missingForecasts}
          </div>
        </div>
      </div>
    </section>
  );
};
