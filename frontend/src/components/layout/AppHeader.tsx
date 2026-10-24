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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand mark & Product identifier */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            <Wind className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                GRIDBRICKS
              </span>
              <span className="text-[9px] text-muted-foreground/60">•</span>
              <span className="text-[10px] font-medium text-muted-foreground">ENERGY</span>
            </div>
            <span className="text-xs font-semibold tracking-tight text-foreground">
              Wind Forecast Intelligence
            </span>
          </div>
        </div>

        {/* Minimal Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a
            href="#overview"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Overview
          </a>
          <a
            href="#forecast"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Forecast vs Actual
          </a>
          <a
            href="#evolution"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Evolution
          </a>
          <a
            href="#accuracy"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Accuracy
          </a>
          <a
            href="#data-quality"
            className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            Data Quality
          </a>
        </nav>

        {/* Status indicator & Controls */}
        <div className="flex items-center gap-3">
          {/* Target delivery month badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
            January 2026
          </div>

          {/* Data Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="tabular-nums">{dataStatus}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
