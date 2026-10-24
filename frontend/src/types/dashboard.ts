export interface ForecastPoint {
  start_time: string; // ISO datetime string: "YYYY-MM-DDTHH:mm:ss"
  publish_time: string; // ISO datetime string: "YYYY-MM-DDTHH:mm:ss"
  generation: number; // MW
}

export interface ActualPoint {
  start_time: string; // ISO datetime string: "YYYY-MM-DDTHH:mm:ss"
  generation: number; // MW
}

export interface ForecastActualPoint {
  start_time: string; // ISO datetime string: "YYYY-MM-DDTHH:mm:ss"
  forecast: number; // MW
  actual: number; // MW
  error: number; // MW (forecast - actual)
}

export interface AccuracyMetrics {
  mae: number; // MW
  rmse: number; // MW
  bias: number; // MW (positive = over-forecast, negative = under-forecast)
}

export interface DailyAccuracy {
  date: string; // "YYYY-MM-DD"
  mae: number; // MW
  rmse: number; // MW
  bias: number; // MW
}

export interface DataQuality {
  actual_records: number; // 1,488 (FUELHH half-hourly actuals)
  forecast_records: number; // 18,080 (WINDFOR hourly multi-publish forecasts)
  matched_records: number; // 744 (evaluated hourly matched periods)
  missing_actuals: number; // 0
  missing_forecasts: number; // 744 (half-hourly actual periods without WINDFOR match)
}

export interface DashboardResponse {
  date: string; // "YYYY-MM-DD"
  latest_forecast: ForecastPoint[];
  forecast_vs_actual: ForecastActualPoint[];
  forecast_evolution: ForecastPoint[];
  metrics: AccuracyMetrics;
  daily_accuracy: DailyAccuracy[];
  data_quality: DataQuality;
}

export interface HealthResponse {
  status: string;
  database: string;
  january_records: {
    actuals: number;
    forecasts: number;
  };
}
