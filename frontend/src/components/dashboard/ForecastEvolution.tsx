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
      <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card/60 p-6" />
    );
  }

  const targetActual = evolution[0]?.actualMW ?? 18000;
  const targetPeriod = evolution[0]?.targetPeriod ?? "14:00 UTC";

  return (
    <div id="evolution" className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Forecast Evolution
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Evolution of WINDFOR runs published for delivery target{" "}
              <span className="font-mono font-semibold text-foreground">{targetPeriod}</span>.
            </p>
          </div>
          <span className="rounded bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground">
            Target: {formatMW(targetActual)}
          </span>
        </div>

        {/* Timeline of published runs */}
        <div className="mt-5 space-y-3">
          {evolution.map((pt) => {
            const diff = pt.forecastMW - pt.actualMW;
            const isClosest = Math.abs(diff) < 200;

            return (
              <div
                key={pt.publishTime}
                className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {pt.displayPublishTime}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({pt.leadHours}h ahead)
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Published WINDFOR run
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-10 sm:pl-0 font-mono">
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
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
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

      <div className="mt-4 border-t border-border/50 pt-3 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Publish time track</span>
        <span className="font-mono text-emerald-500">Error reduced by 94% closer to gate closure</span>
      </div>
    </div>
  );
};
