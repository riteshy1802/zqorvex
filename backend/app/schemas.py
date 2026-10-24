from datetime import datetime

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    start_time: datetime
    publish_time: datetime
    generation: float


class ActualPoint(BaseModel):
    start_time: datetime
    generation: float


class ForecastActualPoint(BaseModel):
    start_time: datetime
    forecast: float
    actual: float
    error: float


class AccuracyMetrics(BaseModel):
    mae: float
    rmse: float
    bias: float


class DailyAccuracy(BaseModel):
    date: str
    mae: float
    rmse: float
    bias: float


class DataQuality(BaseModel):
    actual_records: int
    forecast_records: int
    matched_records: int
    missing_actuals: int
    missing_forecasts: int


class DashboardResponse(BaseModel):
    date: str
    latest_forecast: list[ForecastPoint]
    forecast_vs_actual: list[ForecastActualPoint]
    forecast_evolution: list[ForecastPoint]
    metrics: AccuracyMetrics
    daily_accuracy: list[DailyAccuracy]
    data_quality: DataQuality