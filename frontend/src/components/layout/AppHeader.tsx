import React from "react";
import { Moon, Sun, Wind } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface AppHeaderProps {
  dataStatus?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  dataStatus = "Elexon data loaded",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 sm:h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand mark & Terminal identifier */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-primary/10 text-primary border border-primary/25">
            <Wind className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground">
                GRIDBRICKS
              </span>
              <span className="text-[9px] text-muted-foreground/60">•</span>
              <span className="text-[10px] font-mono font-medium text-muted-foreground">ENERGY TRADING</span>
            </div>
            <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-foreground font-mono">
              Wind Forecast Intelligence
            </span>
          </div>
        </div>

        {/* Minimal Institutional Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-muted-foreground">
          <a
            href="#overview"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
          >
            Overview
          </a>
          <a
            href="#forecast"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
          >
            Forecast vs Actual
          </a>
          <a
            href="#evolution"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
          >
            Evolution
          </a>
          <a
            href="#accuracy"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
          >
            Accuracy
          </a>
          <a
            href="#data-quality"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground cursor-pointer"
          >
            Data Quality
          </a>
        </nav>

        {/* Status indicator & Controls */}
        <div className="flex items-center gap-3">
          {/* Target delivery month badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-mono font-medium bg-muted/60 text-muted-foreground border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            JAN 2026
          </div>

          {/* Crisp Data Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-[2px] text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="tabular-nums">{dataStatus}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
