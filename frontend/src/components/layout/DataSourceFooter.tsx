import React from "react";
import { ExternalLink, Database } from "lucide-react";

export const DataSourceFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-border/60 py-10 transition-colors duration-200">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Data Source & Methodology</span>
          </div>
          <p className="text-xs text-muted-foreground/80">
            Elexon BMRS · <span className="font-mono text-foreground/90">FUELHH</span> (National Wind Actuals) ·{" "}
            <span className="font-mono text-foreground/90">WINDFOR</span> (Day-Ahead & Intraday Forecasts)
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            Delivery periods are 30-minute settlement windows evaluated against corresponding actual outturns for January 2026.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://www.elexon.co.uk/bmrs-insights-solution/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Elexon Insights Solution</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-border">•</span>
          <span className="text-[11px] font-mono text-muted-foreground/60">
            GB Transmission System · UTC
          </span>
        </div>
      </div>
    </footer>
  );
};
