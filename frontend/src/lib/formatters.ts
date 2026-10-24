/**
 * Number and Date Formatting utilities for Wind Forecast Intelligence
 * All times are displayed in UTC in compliance with Elexon BMRS standards.
 */

export function parseUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If no timezone indicator, append Z to treat as UTC
  if (!dateStr.endsWith("Z") && !dateStr.includes("+") && !dateStr.includes("-", 10)) {
    return new Date(`${dateStr}Z`);
  }
  return new Date(dateStr);
}

export function formatGW(valueMW: number | null | undefined, decimals = 2): string {
  if (valueMW === null || valueMW === undefined || isNaN(valueMW)) return "—";
  const gw = valueMW / 1000;
  return `${gw.toFixed(decimals)} GW`;
}

export function formatMW(valueMW: number | null | undefined): string {
  if (valueMW === null || valueMW === undefined || isNaN(valueMW)) return "—";
  return `${Math.round(valueMW).toLocaleString()} MW`;
}

export function formatSignedGW(valueGW: number | null | undefined, decimals = 2): string {
  if (valueGW === null || valueGW === undefined || isNaN(valueGW)) return "—";
  const sign = valueGW > 0 ? "+" : "";
  return `${sign}${valueGW.toFixed(decimals)} GW`;
}

export function formatSignedMW(valueMW: number | null | undefined): string {
  if (valueMW === null || valueMW === undefined || isNaN(valueMW)) return "—";
  const sign = valueMW > 0 ? "+" : "";
  return `${sign}${Math.round(valueMW).toLocaleString()} MW`;
}

export function formatPercentage(ratio: number | null | undefined, decimals = 1): string {
  if (ratio === null || ratio === undefined || isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(decimals)}%`;
}

export function formatSettlementHour(isoTime: string): string {
  if (!isoTime) return "—";
  const d = parseUtcDate(isoTime);
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} UTC`;
}

export function formatShortHour(isoTime: string): string {
  if (!isoTime) return "—";
  const d = parseUtcDate(isoTime);
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatPublishDateTime(isoTime: string): string {
  if (!isoTime) return "—";
  const d = parseUtcDate(isoTime);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${hours}:${minutes} UTC`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}

export function formatDayMonth(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = parts[2].padStart(2, "0");
    const month = months[parseInt(parts[1], 10) - 1];
    return `${day} ${month}`;
  }
  return dateStr;
}

export function computeLeadHours(startTimeStr: string, publishTimeStr: string): number {
  const start = parseUtcDate(startTimeStr).getTime();
  const pub = parseUtcDate(publishTimeStr).getTime();
  const diffHours = (start - pub) / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10;
}
