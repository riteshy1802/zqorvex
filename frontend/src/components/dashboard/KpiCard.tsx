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
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-md">
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl tabular-nums">
          {value}
        </span>
        {contextTag && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {contextTag}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
        <span>{subValue}</span>
        {trendText && (
          <span
            className={`font-mono text-[11px] font-medium ${
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
