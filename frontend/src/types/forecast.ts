export type DeliveryPeriod = number; // 1 to 48 (30-min intervals)

export interface HalfHourRecord {
  period: DeliveryPeriod;
  startTime: string; // ISO string or UTC "HH:mm"
  endTime: string;
  targetDate: string; // "YYYY-MM-DD"
  forecastMW: number;
  actualMW: number | null; // null if future delivery
  errorMW: number | null; // actual - forecast
  absErrorMW: number | null;
  publishTime: string; // when latest forecast was published
}

export interface DayForecastSummary {
  date: string; // "2026-01-14"
  records: HalfHourRecord[];
  latestPublishTime: string;
  latestForecastGW: number;
  dailyMAE_GW: number;
  dailyRMSE_GW: number;
  dailyBias_GW: number;
}

export interface EvolutionPoint {
  publishTime: string; // e.g. "2026-01-14T02:00:00Z"
  displayPublishTime: string; // "02:00 UTC"
  forecastMW: number;
  targetPeriod: string; // e.g. "14:00 UTC"
  actualMW: number;
  leadHours: number; // hours before delivery
}

export interface DailyAccuracyRecord {
  date: string; // "2026-01-01"
  dayLabel: string; // "01 Jan"
  maeGW: number;
  rmseGW: number;
  biasGW: number;
  actualAvgGW: number;
  forecastAvgGW: number;
}

export interface AccuracySummaryMetrics {
  period: string; // "January 2026"
  totalSettlementPeriods: number;
  evaluatedPeriods: number;
  maeGW: number;
  rmseGW: number;
  biasGW: number;
  interpretation: string;
  tendency: "under" | "over" | "neutral";
}

export interface DataQualityStats {
  source: string;
  actualsDataset: string;
  forecastDataset: string;
  period: string;
  resolution: string;
  totalPeriods: number;
  matchedPeriods: number;
  missingActuals: number;
  missingForecasts: number;
  dataLatency: string;
  lastUpdated: string;
}
