import React from "react";
import { Clock, History, CheckCircle2 } from "lucide-react";
import { ForecastPoint } from "../../types/dashboard";
import {
  computeLeadHours,
  formatMW,
  formatPublishDateTime,
  formatSettlementHour,
  formatSignedMW,
} from "../../lib/formatters";

interface ForecastEvolutionProps {
  evolution: ForecastPoint[];
  targetActualMW?: number;
  isLoading?: boolean;
}

export const ForecastEvolution: React.FC<ForecastEvolutionProps> = ({
  evolution,
  targetActualMW,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[350px] animate-pulse rounded-[2px] border border-border bg-card/60 p-5" />
    );
  }

  const targetPeriod = evolution.length > 0 ? formatSettlementHour(evolution[0].start_time) : "14:00 UTC";

  // Sort chronological by publish_time ascending to show sequential convergence
  const sortedEvolution = [...evolution].sort(
    (a, b) => new Date(a.publish_time).getTime() - new Date(b.publish_time).getTime()
  );

  // Identify point with minimum absolute error to target actual if available
  let minDiff = Infinity;
  let closestIndex = -1;
  if (targetActualMW !== undefined) {
    sortedEvolution.forEach((pt, idx) => {
      const diff = Math.abs(pt.generation - targetActualMW);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
  }

  // Gate closure point (latest published run prior to delivery)
  const finalRun = sortedEvolution[sortedEvolution.length - 1];
  const finalError = (finalRun && targetActualMW !== undefined)
    ? finalRun.generation - targetActualMW
    : null;

  return (
    <div id="evolution" className="flex flex-col justify-between rounded-[2px] border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                Forecast Evolution by publishTime
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sequential WINDFOR publications converging to delivery period{" "}
              <span className="font-mono font-semibold text-foreground">{targetPeriod}</span>.
            </p>
          </div>
          {targetActualMW !== undefined && (
            <span className="rounded-[2px] border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              Actual Outturn: {formatMW(targetActualMW)}
            </span>
          )}
        </div>

        {/* Timeline of published runs */}
        <div className="mt-4 space-y-2 max-h-[290px] overflow-y-auto pr-1">
          {sortedEvolution.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground font-mono">
              No historical evolution runs recorded for this period.
            </div>
          ) : (
            sortedEvolution.map((pt, idx) => {
              const leadHours = computeLeadHours(pt.start_time, pt.publish_time);
              const diff = targetActualMW !== undefined ? pt.generation - targetActualMW : null;
              const isClosest = idx === closestIndex;

              return (
                <div
                  key={`${pt.publish_time}-${idx}`}
                  className="group flex flex-col gap-2 rounded-[2px] border border-border/60 bg-muted/20 p-2.5 text-xs transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-muted text-muted-foreground border border-border/40">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">
                          {formatPublishDateTime(pt.publish_time)}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ({leadHours > 0 ? `${leadHours}h lead` : "delivery run"})
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Published WINDFOR Run
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-8 sm:pl-0 font-mono">
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        {formatMW(pt.generation)}
                      </div>
                      {diff !== null && (
                        <div
                          className={`text-[10px] ${
                            diff > 0 ? "text-rose-500" : diff < 0 ? "text-emerald-500" : "text-muted-foreground"
                          }`}
                        >
                          {formatSignedMW(diff)} {diff > 0 ? "over" : diff < 0 ? "under" : "exact"}
                        </div>
                      )}
                    </div>

                    {isClosest && (
                      <span className="flex items-center gap-1 rounded-[2px] bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-emerald-500 border border-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3" />
                        Closest
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border/50 pt-2.5 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Delivery Target: {targetPeriod}</span>
        {finalError !== null && (
          <span className={finalError > 0 ? "text-rose-500" : "text-emerald-500"}>
            Final Run Drift: {formatSignedMW(finalError)}
          </span>
        )}
      </div>
    </div>
  );
};
