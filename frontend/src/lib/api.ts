import {
  AccuracySummaryMetrics,
  DailyAccuracyRecord,
  DataQualityStats,
  DayForecastSummary,
  EvolutionPoint,
} from "../types/forecast";
import {
  generateDayData,
  generateForecastEvolution,
  generateJanuaryAccuracy,
  MOCK_DATA_QUALITY,
} from "./mock-elexon-data";

/**
 * Service API layer for Wind Forecast Intelligence
 * Ready to integrate with real backend endpoints while providing seamless, fast access
 */

export const api = {
  /**
   * Fetch 48 settlement periods for a given delivery date (YYYY-MM-DD)
   */
  async getDeliveryForecast(date: string): Promise<DayForecastSummary> {
    // Simulate brief network delay for realism if needed, or instant
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateDayData(date));
      }, 60);
    });
  },

  /**
   * Fetch multi-publishTime forecast evolution for a target period
   */
  async getForecastEvolution(date: string): Promise<EvolutionPoint[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateForecastEvolution(date));
      }, 50);
    });
  },

  /**
   * Fetch January 2026 accuracy historical trends and summary metrics
   */
  async getAccuracyAnalytics(): Promise<{
    dailyRecords: DailyAccuracyRecord[];
    summary: AccuracySummaryMetrics;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateJanuaryAccuracy());
      }, 80);
    });
  },

  /**
   * Fetch data quality audit statistics
   */
  async getDataQuality(): Promise<DataQualityStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_DATA_QUALITY);
      }, 40);
    });
  },
};
