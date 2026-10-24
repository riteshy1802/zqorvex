import { Info, Award } from "lucide-react";
import { AccuracySummaryMetrics } from "../../types/forecast";
import { formatSignedGW } from "../../lib/formatters";

interface AccuracyMetricsProps {
  summary: AccuracySummaryMetrics;
  isLoading?: boolean;
}

export const AccuracyMetrics: React.FC<AccuracyMetricsProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card/60 p-6" />
    );
  }

  return (
    <div id="accuracy-metrics" className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold tracking-tight text-foreground">
                January Accuracy & Semantics
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Statistical reliability across all 1,488 settlement periods in January 2026.
            </p>
          </div>
          <span className="rounded bg-primary/10 px-2 py-1 text-[11px] font-mono text-primary border border-primary/20">
            N = {summary.evaluatedPeriods}
          </span>
        </div>

        {/* 3 Metrics Row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              MAE
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {summary.maeGW.toFixed(2)} GW
            </div>
            <span className="text-[10px] text-muted-foreground">Average absolute drift</span>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              RMSE
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {summary.rmseGW.toFixed(2)} GW
            </div>
            <span className="text-[10px] text-muted-foreground">Outlier-weighted</span>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              BIAS
            </span>
            <div
              className={`mt-1 font-mono text-xl font-bold ${
                summary.biasGW > 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {formatSignedGW(summary.biasGW, 2)}
            </div>
            <span className="text-[10px] text-muted-foreground">Net directionality</span>
          </div>
        </div>

        {/* Error Semantics Formula Box */}
        <div className="mt-5 rounded-lg border border-border/70 bg-card p-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Strict Error Definition</span>
          </div>
          <div className="mt-2 font-mono text-xs rounded bg-muted/60 px-2.5 py-1.5 text-foreground/90">
            Error = Actual Generation − Forecast Generation
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Positive (+): Actual &gt; Forecast (Under-forecast)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>Negative (−): Forecast &gt; Actual (Over-forecast)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Analytical Interpretation */}
        <div className="mt-4 rounded-lg border border-border/60 bg-primary/5 p-3.5 text-xs border-primary/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Trading Desk Interpretation
          </div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            {summary.interpretation}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
        Generated directly from Elexon settlement records without heuristic bias.
      </div>
    </div>
  );
};
