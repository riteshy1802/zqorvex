import {
  AccuracySummaryMetrics,
  DailyAccuracyRecord,
  DataQualityStats,
  DayForecastSummary,
  EvolutionPoint,
  HalfHourRecord,
} from "../types/forecast";

// Helper: Seeded pseudo-random generator for consistent numbers
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate 48 settlement periods for a given January 2026 day
export function generateDayData(dateStr: string): DayForecastSummary {
  // dateStr is "2026-01-DD"
  const dayNum = parseInt(dateStr.split("-")[2] || "14", 10);
  const records: HalfHourRecord[] = [];

  // Wind pattern base curve: peak around afternoon / evening front
  const daySeed = dayNum * 137;
  const baseCapacity = 11000 + Math.sin(dayNum * 0.45) * 5500; // 6 to 18 GW average

  let sumAbsError = 0;
  let sumSquaredError = 0;
  let sumError = 0;
  let count = 0;

  for (let period = 1; period <= 48; period++) {
    const totalMinutes = (period - 1) * 30;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

    const endMinutes = totalMinutes + 30;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

    // Diurnal & atmospheric curve
    const phase = (period / 48) * Math.PI * 2;
    const noise = (pseudoRandom(daySeed + period) - 0.48) * 1200;
    const diurnal = Math.sin(phase - 1.2) * 2800 + Math.cos(phase * 2) * 900;

    const forecastMW = Math.max(3500, Math.round(baseCapacity + diurnal + noise));

    // Forecast error dynamics (weather timing offset)
    const errorNoise = (pseudoRandom(daySeed * 2 + period * 7) - 0.45) * 1450;
    const rampError = Math.cos(phase * 1.5) * 600;
    const actualMW = Math.max(3200, Math.round(forecastMW + errorNoise + rampError));

    const errorMW = actualMW - forecastMW; // Semantics: Actual - Forecast
    const absErrorMW = Math.abs(errorMW);

    sumError += errorMW;
    sumAbsError += absErrorMW;
    sumSquaredError += errorMW * errorMW;
    count++;

    // Latest publish time for this delivery period (typically 2-4 hours before delivery)
    const pubHours = Math.max(0, hours - 3);
    const pubTimeStr = `${pubHours.toString().padStart(2, "0")}:00 UTC`;

    records.push({
      period,
      startTime: timeStr,
      endTime: endTimeStr,
      targetDate: dateStr,
      forecastMW,
      actualMW,
      errorMW,
      absErrorMW,
      publishTime: pubTimeStr,
    });
  }

  const dailyMAE_GW = Number((sumAbsError / count / 1000).toFixed(2));
  const dailyRMSE_GW = Number((Math.sqrt(sumSquaredError / count) / 1000).toFixed(2));
  const dailyBias_GW = Number((sumError / count / 1000).toFixed(2));

  // The latest forecast in the day (last period or mid-day highlight)
  const latestForecastGW = Number((records[records.length - 1].forecastMW / 1000).toFixed(1));

  return {
    date: dateStr,
    records,
    latestPublishTime: "06:00 UTC",
    latestForecastGW,
    dailyMAE_GW,
    dailyRMSE_GW,
    dailyBias_GW,
  };
}

// Generate multi-publishTime forecast evolution for a target period (e.g. 14:00 UTC on selected date)
export function generateForecastEvolution(dateStr: string): EvolutionPoint[] {
  const dayNum = parseInt(dateStr.split("-")[2] || "14", 10);
  const targetActualMW = 17960 + Math.sin(dayNum) * 1200;

  // Forecasts issued at 24h, 12h, 8h, 6h, 4h, and 1h ahead
  return [
    {
      publishTime: "2026-01-13T14:00:00Z",
      displayPublishTime: "D-1 14:00",
      leadHours: 24,
      forecastMW: Math.round(targetActualMW - 1480),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
    {
      publishTime: `${dateStr}T02:00:00Z`,
      displayPublishTime: "02:00 UTC",
      leadHours: 12,
      forecastMW: Math.round(targetActualMW - 920),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
    {
      publishTime: `${dateStr}T06:00:00Z`,
      displayPublishTime: "06:00 UTC",
      leadHours: 8,
      forecastMW: Math.round(targetActualMW + 640),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
    {
      publishTime: `${dateStr}T08:00:00Z`,
      displayPublishTime: "08:00 UTC",
      leadHours: 6,
      forecastMW: Math.round(targetActualMW + 460),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
    {
      publishTime: `${dateStr}T10:00:00Z`,
      displayPublishTime: "10:00 UTC",
      leadHours: 4,
      forecastMW: Math.round(targetActualMW + 210),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
    {
      publishTime: `${dateStr}T13:00:00Z`,
      displayPublishTime: "13:00 UTC",
      leadHours: 1,
      forecastMW: Math.round(targetActualMW + 80),
      actualMW: Math.round(targetActualMW),
      targetPeriod: "14:00 UTC",
    },
  ];
}

// Generate the 31-day January 2026 accuracy record
export function generateJanuaryAccuracy(): {
  dailyRecords: DailyAccuracyRecord[];
  summary: AccuracySummaryMetrics;
} {
  const dailyRecords: DailyAccuracyRecord[] = [];
  let totalMAE = 0;
  let totalRMSE = 0;
  let totalBias = 0;

  for (let day = 1; day <= 31; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const date = `2026-01-${dayStr}`;
    const dayData = generateDayData(date);

    totalMAE += dayData.dailyMAE_GW;
    totalRMSE += dayData.dailyRMSE_GW;
    totalBias += dayData.dailyBias_GW;

    // Calculate daily average generation
    const sumActual = dayData.records.reduce((acc, r) => acc + (r.actualMW || 0), 0);
    const sumForecast = dayData.records.reduce((acc, r) => acc + r.forecastMW, 0);

    dailyRecords.push({
      date,
      dayLabel: `${dayStr} Jan`,
      maeGW: dayData.dailyMAE_GW,
      rmseGW: dayData.dailyRMSE_GW,
      biasGW: dayData.dailyBias_GW,
      actualAvgGW: Number((sumActual / 48 / 1000).toFixed(2)),
      forecastAvgGW: Number((sumForecast / 48 / 1000).toFixed(2)),
    });
  }

  const daysCount = 31;
  const maeGW = Number((totalMAE / daysCount).toFixed(2));
  const rmseGW = Number((totalRMSE / daysCount).toFixed(2));
  const biasGW = Number((totalBias / daysCount).toFixed(2));

  let tendency: "under" | "over" | "neutral" = "neutral";
  let interpretation = "Forecasts have been balanced without significant directional skew.";

  if (biasGW > 0.05) {
    tendency = "under";
    interpretation = `Forecasts have a systematic tendency to under-estimate actual generation by an average of ${biasGW.toFixed(2)} GW across January 2026.`;
  } else if (biasGW < -0.05) {
    tendency = "over";
    interpretation = `Forecasts have a systematic tendency to over-estimate actual generation by an average of ${Math.abs(biasGW).toFixed(2)} GW across January 2026.`;
  }

  return {
    dailyRecords,
    summary: {
      period: "January 2026",
      totalSettlementPeriods: 1488, // 31 * 48
      evaluatedPeriods: 1488,
      maeGW,
      rmseGW,
      biasGW,
      interpretation,
      tendency,
    },
  };
}

// Data Quality statistics for January 2026
export const MOCK_DATA_QUALITY: DataQualityStats = {
  source: "Elexon BMRS / Insights Solution",
  actualsDataset: "FUELHH (Half-Hourly Fuel Generation)",
  forecastDataset: "WINDFOR (National Wind Generation Forecast)",
  period: "January 2026",
  resolution: "30-minute Settlement Periods",
  totalPeriods: 1488,
  matchedPeriods: 1476,
  missingActuals: 0,
  missingForecasts: 12,
  dataLatency: "< 5 minutes post-settlement",
  lastUpdated: "2026-01-31T23:59:59Z",
};
