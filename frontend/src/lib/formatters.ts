/**
 * Number and Date Formatting utilities for Wind Forecast Intelligence
 */

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

export function formatSettlementTime(startTime: string): string {
  // expects "HH:mm" or ISO string
  if (startTime.includes("T")) {
    const d = new Date(startTime);
    return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")} UTC`;
  }
  return `${startTime} UTC`;
}

export function formatDisplayDate(dateStr: string): string {
  // expects "YYYY-MM-DD" e.g. "2026-01-14"
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}
