import React from "react";

interface KpiCardProps {
  label: string;
  value: string;
  subValue: string;
  contextTag?: string;
  icon: React.ReactNode;
  trend?: "positive" | "negative" | "neutral";
  trendText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  contextTag,
  icon,
  trend = "neutral",
  trendText,
}) => {
  return (
    <div className="group relative rounded-[2px] border border-border bg-card p-4 shadow-sm transition-colors duration-150 hover:border-border-strong cursor-default">
      {/* Top 1px subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-muted/60 text-muted-foreground border border-border/50">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {contextTag && (
          <span className="rounded-[2px] border border-border bg-muted/40 px-1 py-0.2 text-[9px] font-mono text-muted-foreground">
            {contextTag}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground font-mono">
        <span>{subValue}</span>
        {trendText && (
          <span
            className={`text-[10px] font-semibold ${
              trend === "positive"
                ? "text-emerald-500"
                : trend === "negative"
                ? "text-rose-500"
                : "text-muted-foreground"
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
