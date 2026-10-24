import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatDisplayDate } from "../../lib/formatters";

interface DeliverySelectorProps {
  selectedDate: string; // "YYYY-MM-DD" e.g. "2026-01-14"
  onSelectDate: (date: string) => void;
}

export const DeliverySelector: React.FC<DeliverySelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const currentDay = parseInt(selectedDate.split("-")[2] || "14", 10);

  const prevDate = currentDay > 1 ? `2026-01-${(currentDay - 1).toString().padStart(2, "0")}` : null;
  const nextDate = currentDay < 31 ? `2026-01-${(currentDay + 1).toString().padStart(2, "0")}` : null;

  const handlePrev = () => {
    if (prevDate) onSelectDate(prevDate);
  };

  const handleNext = () => {
    if (nextDate) onSelectDate(nextDate);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
        {/* Previous day stepper button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!prevDate}
          aria-label="Previous delivery day"
          className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {prevDate ? `${currentDay - 1} Jan` : "—"}
          </span>
        </button>

        {/* Selected Date Indicator with quick-picker */}
        <div className="relative mx-1">
          <div className="flex h-8 items-center gap-2 rounded-md bg-primary/10 px-3 text-xs font-semibold text-primary border border-primary/25">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="tracking-tight font-mono">{formatDisplayDate(selectedDate)}</span>
          </div>
        </div>

        {/* Next day stepper button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!nextDate}
          aria-label="Next delivery day"
          className="flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">
            {nextDate ? `${currentDay + 1} Jan` : "—"}
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quick Jump Dropdown for January 2026 */}
      <select
        value={selectedDate}
        onChange={(e) => onSelectDate(e.target.value)}
        aria-label="Select January 2026 delivery day"
        className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-mono font-medium text-foreground shadow-sm hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
      >
        {Array.from({ length: 31 }, (_, i) => {
          const day = (i + 1).toString().padStart(2, "0");
          const dateVal = `2026-01-${day}`;
          return (
            <option key={dateVal} value={dateVal} className="bg-card text-foreground">
              {day} Jan 2026
            </option>
          );
        })}
      </select>
    </div>
  );
};
