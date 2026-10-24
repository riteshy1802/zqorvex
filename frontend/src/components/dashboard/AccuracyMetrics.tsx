import React from "react";
import { Info, Award } from "lucide-react";
import { AccuracyMetrics as MetricsType, DataQuality } from "../../types/dashboard";
import { formatGW, formatMW, formatSignedGW, formatSignedMW } from "../../lib/formatters";

interface AccuracyMetricsProps {
  metrics: MetricsType;
  dataQuality?: DataQuality;
  isLoading?: boolean;
}

export const AccuracyMetrics: React.FC<AccuracyMetricsProps> = ({
  metrics,
  dataQuality,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[350px] animate-pulse rounded-[2px] border border-border bg-card/60 p-5" />
    );
  }

  const isOver = metrics.bias > 0;
  const isUnder = metrics.bias < 0;
  const sampleCount = dataQuality?.matched_records ?? 744;

  const biasDescription = isOver
    ? `The national wind forecast exhibited a persistent positive bias of +${formatGW(metrics.bias, 2)} (+${formatMW(metrics.bias)}), indicating that actual outturn was consistently lower than day-ahead projections across January 2026.`
    : isUnder
    ? `The national wind forecast exhibited an under-forecasting bias of ${formatGW(metrics.bias, 2)}, indicating that outturn generation exceeded day-ahead expectations.`
    : `The national wind forecast was unbiased with balanced errors across the evaluation window.`;

  return (
    <div id="accuracy-metrics" className="flex flex-col justify-between rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                January Accuracy & Error Semantics
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Statistical reliability across evaluated settlement windows in January 2026.
            </p>
          </div>
          <span className="rounded-[2px] border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            N = {sampleCount} Hourly Periods
          </span>
        </div>

        {/* 3 Metrics Row (Sharp corners) */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-[2px] border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              MAE
            </span>
            <div className="mt-0.5 font-mono text-lg font-bold text-foreground">
              {formatGW(metrics.mae, 2)}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{formatMW(metrics.mae)}</span>
          </div>

          <div className="rounded-[2px] border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              RMSE
            </span>
            <div className="mt-0.5 font-mono text-lg font-bold text-foreground">
              {formatGW(metrics.rmse, 2)}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{formatMW(metrics.rmse)}</span>
          </div>

          <div className="rounded-[2px] border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              BIAS
            </span>
            <div
              className={`mt-0.5 font-mono text-lg font-bold ${
                isOver ? "text-rose-500" : isUnder ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {formatSignedGW(metrics.bias / 1000, 2)}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{formatSignedMW(metrics.bias)}</span>
          </div>
        </div>

        {/* Error Semantics Formula Box */}
        <div className="mt-4 rounded-[2px] border border-border bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
            <Info className="h-3 w-3 text-primary" />
            <span>Strict Error Definition & Sign Convention</span>
          </div>
          <div className="mt-1.5 font-mono text-xs rounded-[2px] border border-border/60 bg-card px-2.5 py-1 text-foreground">
            Error = Forecast (WINDFOR) − Actual Outturn (FUELHH)
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-rose-500" />
              <span>Positive (+): Over-forecasted (Fct &gt; Act)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-emerald-500" />
              <span>Negative (−): Under-forecasted (Fct &lt; Act)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Analytical Interpretation */}
        <div className="mt-3.5 rounded-[2px] border border-primary/25 bg-primary/5 p-3 text-xs">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">
            Desk Analytical Summary
          </div>
          <p className="mt-1 text-muted-foreground leading-relaxed text-xs">
            {biasDescription} The RMSE/MAE ratio of {(metrics.rmse / (metrics.mae || 1)).toFixed(2)} indicates occasional heavy penalties during rapid ramp events and meteorological frontal shifts.
          </p>
        </div>
      </div>

      <div className="mt-3.5 border-t border-border/50 pt-2 text-[10px] font-mono text-muted-foreground">
        Calculated directly across native hourly matched Elexon settlement records.
      </div>
    </div>
  );
};
