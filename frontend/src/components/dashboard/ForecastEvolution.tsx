import React from "react";
import { Clock, History, CheckCircle2 } from "lucide-react";
import { EvolutionPoint } from "../../types/forecast";
import { formatMW, formatSignedMW } from "../../lib/formatters";

interface ForecastEvolutionProps {
  evolution: EvolutionPoint[];
  isLoading?: boolean;
}

export const ForecastEvolution: React.FC<ForecastEvolutionProps> = ({
  evolution,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[350px] animate-pulse rounded-[2px] border border-border bg-card/60 p-5" />
    );
  }

  const targetActual = evolution[0]?.actualMW ?? 18000;
  const targetPeriod = evolution[0]?.targetPeriod ?? "14:00 UTC";

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
              Convergence of sequential WINDFOR publication runs for delivery target{" "}
              <span className="font-mono font-semibold text-foreground">{targetPeriod}</span>.
            </p>
          </div>
          <span className="rounded-[2px] border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            Target: {formatMW(targetActual)}
          </span>
        </div>

        {/* Timeline of published runs */}
        <div className="mt-4 space-y-2">
          {evolution.map((pt) => {
            const diff = pt.forecastMW - pt.actualMW;
            const isClosest = Math.abs(diff) < 200;

            return (
              <div
                key={pt.publishTime}
                className="group flex flex-col gap-2 rounded-[2px] border border-border/60 bg-muted/20 p-2.5 text-xs transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-muted text-muted-foreground border border-border/40">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {pt.displayPublishTime}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ({pt.leadHours}h lead)
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
                      {formatMW(pt.forecastMW)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        diff > 0 ? "text-rose-500" : "text-emerald-500"
                      }`}
                    >
                      {formatSignedMW(-diff)} vs actual
                    </div>
                  </div>

                  {isClosest && (
                    <span className="flex items-center gap-1 rounded-[2px] bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-emerald-500 border border-emerald-500/25">
                      <CheckCircle2 className="h-3 w-3" />
                      Converged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-border/50 pt-2.5 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Publish Track Delta</span>
        <span className="text-emerald-500">Convergence error: 80 MW at gate closure</span>
      </div>
    </div>
  );
};
