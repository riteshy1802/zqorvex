import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { formatDisplayDate } from "../../lib/formatters";

interface DeliverySelectorProps {
  selectedDate: string; // "YYYY-MM-DD" e.g. "2026-01-14"
  onSelectDate: (date: string) => void;
}

export const DeliverySelector: React.FC<DeliverySelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [open, setOpen] = useState(false);
  const currentDay = parseInt(selectedDate.split("-")[2] || "14", 10);

  const prevDate = currentDay > 1 ? `2026-01-${(currentDay - 1).toString().padStart(2, "0")}` : null;
  const nextDate = currentDay < 31 ? `2026-01-${(currentDay + 1).toString().padStart(2, "0")}` : null;

  const handlePrev = () => {
    if (prevDate) onSelectDate(prevDate);
  };

  const handleNext = () => {
    if (nextDate) onSelectDate(nextDate);
  };

  const handleSelectDay = (day: number) => {
    const formatted = `2026-01-${day.toString().padStart(2, "0")}`;
    onSelectDate(formatted);
    setOpen(false);
  };

  // January 1, 2026 starts on a Thursday (day index 3 in 0-indexed Mon-Sun: Mon=0, Tue=1, Wed=2, Thu=3)
  const firstDayOffset = 3;
  const daysInJanuary = 31;
  const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-[2px] border border-border bg-card p-1 shadow-sm">
        {/* Previous day stepper button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!prevDate}
          aria-label="Previous delivery day"
          className="flex h-8 items-center gap-1 rounded-[2px] px-2.5 text-xs font-mono font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {prevDate ? `${(currentDay - 1).toString().padStart(2, "0")} JAN` : "—"}
          </span>
        </button>

        {/* Popover Date Trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-2 rounded-[2px] bg-primary/10 hover:bg-primary/15 px-3 text-xs font-semibold text-primary border border-primary/25 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <span className="tracking-tight font-mono">{formatDisplayDate(selectedDate)}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
          </PopoverTrigger>

          <PopoverContent align="center" className="w-[280px] p-3 rounded-[2px] bg-card border-border shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
              <span className="text-xs font-mono font-bold tracking-wider text-foreground">
                JANUARY 2026
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                48 SP / DAY
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {weekdays.map((wd) => (
                <span key={wd} className="text-[9px] font-mono font-semibold text-muted-foreground">
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar grid for January 2026 */}
            <div className="grid grid-cols-7 gap-1">
              {/* Blank cells for offset before Thursday Jan 1 */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`blank-${i}`} className="h-7 w-7" />
              ))}

              {/* Days 1 to 31 */}
              {Array.from({ length: daysInJanuary }, (_, i) => {
                const day = i + 1;
                const isSelected = day === currentDay;

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`flex h-7 w-7 items-center justify-center rounded-[2px] text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "hover:bg-muted text-foreground hover:text-primary"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick jump presets */}
            <div className="mt-3 pt-2.5 border-t border-border/60 grid grid-cols-3 gap-1 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleSelectDay(7)}
                className="py-1 px-1.5 rounded-[2px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-center cursor-pointer transition-colors"
              >
                07 JAN
              </button>
              <button
                type="button"
                onClick={() => handleSelectDay(14)}
                className="py-1 px-1.5 rounded-[2px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-center cursor-pointer transition-colors"
              >
                14 JAN
              </button>
              <button
                type="button"
                onClick={() => handleSelectDay(28)}
                className="py-1 px-1.5 rounded-[2px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-center cursor-pointer transition-colors"
              >
                28 JAN
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Next day stepper button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!nextDate}
          aria-label="Next delivery day"
          className="flex h-8 items-center gap-1 rounded-[2px] px-2.5 text-xs font-mono font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">
            {nextDate ? `${(currentDay + 1).toString().padStart(2, "0")} JAN` : "—"}
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
