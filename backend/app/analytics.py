import math
from datetime import date, datetime, timedelta, timezone
from typing import Literal

from sqlalchemy import func, select

from .models import ActualGeneration, WindForecast
from .schemas import (
    AccuracyMetrics,
    DailyAccuracy,
    DashboardResponse,
    DataQuality,
    ForecastActualPoint,
    ForecastPoint,
)

JANUARY_START = datetime(2026, 1, 1, 0, 0, 0)
FEBRUARY_START = datetime(2026, 2, 1, 0, 0, 0)

import os

# Forecast selection policy for quantitative day-ahead accuracy evaluation:
# NOTE: The Gridbricks challenge specification does NOT explicitly dictate a cutoff horizon
# such as D-1 17:00 UTC. Therefore, 17:00 UTC is treated as an implementation assumption
# (reflecting standard UK ESO day-ahead indicative scheduling) and is made fully configurable.
#
# Supported policies:
# - "D_MINUS_1_1700": Latest forecast published on or before D-1 17:00 UTC (default assumption)
# - "D_MINUS_1_2359": Latest forecast published before the delivery day begins (D-1 23:59:59 UTC)
# - "LATEST_PRE_DELIVERY": Latest forecast published prior to delivery period start_time
DayAheadPolicy = Literal["D_MINUS_1_1700", "D_MINUS_1_2359", "LATEST_PRE_DELIVERY"]
DEFAULT_POLICY: DayAheadPolicy = os.getenv("DAY_AHEAD_POLICY", "D_MINUS_1_1700")  # type: ignore


def compute_accuracy_metrics(errors: list[float]) -> AccuracyMetrics:
    """
    Computes MAE, RMSE, and Bias from a list of signed errors (error = forecast - actual).

    Sign convention:
    - Positive error/bias: forecast > actual (over-forecast)
    - Negative error/bias: actual > forecast (under-forecast)
    """
    if not errors:
        return AccuracyMetrics(mae=0.0, rmse=0.0, bias=0.0)

    n = len(errors)
    mae = sum(abs(e) for e in errors) / n
    rmse = math.sqrt(sum(e * e for e in errors) / n)
    bias = sum(errors) / n

    return AccuracyMetrics(
        mae=round(mae, 2),
        rmse=round(rmse, 2),
        bias=round(bias, 2),
    )


def get_selected_forecasts_for_range(
    db,
    start_time: datetime,
    end_time: datetime,
    policy: DayAheadPolicy = DEFAULT_POLICY,
) -> dict[datetime, tuple[datetime, float]]:
    """
    Retrieves the selected forecast for each delivery start_time in [start_time, end_time).
    Returns a dictionary mapping delivery_start_time -> (publish_time, generation).
    """
    # Fetch all candidate forecasts in range ordered by start_time and publish_time descending
    query = (
        select(
            WindForecast.start_time,
            WindForecast.publish_time,
            WindForecast.generation,
        )
        .where(
            WindForecast.start_time >= start_time,
            WindForecast.start_time < end_time,
        )
        .order_by(WindForecast.start_time, WindForecast.publish_time.desc())
    )
    rows = db.execute(query).all()

    selected: dict[datetime, tuple[datetime, float]] = {}

    for st, pt, gen in rows:
        if st in selected:
            continue

        day_start = st.replace(hour=0, minute=0, second=0, microsecond=0)

        if policy == "D_MINUS_1_1700":
            cutoff = day_start - timedelta(hours=7)  # D-1 17:00 UTC (UK ESO Day-Ahead Indicative assumption)
        elif policy == "D_MINUS_1_2359":
            cutoff = day_start  # D-1 23:59:59 UTC (Start of delivery day)
        else:  # LATEST_PRE_DELIVERY
            cutoff = st  # Gate closure before delivery period start

        if pt <= cutoff:
            selected[st] = (pt, gen)

    return selected


def get_latest_forecasts_for_day(
    db,
    day_start: datetime,
    day_end: datetime,
) -> list[ForecastPoint]:
    """
    Returns the latest available forecast published prior to delivery for each period on the given day.
    Filters out retrospective post-delivery stream records (publish_time <= start_time).
    """
    rows = db.execute(
        select(
            WindForecast.start_time,
            WindForecast.publish_time,
            WindForecast.generation,
        )
        .where(
            WindForecast.start_time >= day_start,
            WindForecast.start_time < day_end,
            WindForecast.publish_time <= WindForecast.start_time,
        )
        .order_by(WindForecast.start_time, WindForecast.publish_time.desc())
    ).all()

    seen = set()
    points = []
    for st, pt, gen in rows:
        if st in seen:
            continue
        seen.add(st)
        points.append(
            ForecastPoint(
                start_time=st,
                publish_time=pt,
                generation=round(gen, 1),
            )
        )

    # Sort chronologically by delivery start_time
    points.sort(key=lambda p: p.start_time)
    return points


def get_forecast_evolution_for_target(
    db,
    target_start_time: datetime,
) -> list[ForecastPoint]:
    """
    Returns all sequential forecast publication runs leading up to gate closure for a specific delivery period.
    Filters out retrospective post-delivery records (publish_time <= target_start_time).
    """
    rows = db.execute(
        select(
            WindForecast.start_time,
            WindForecast.publish_time,
            WindForecast.generation,
        )
        .where(
            WindForecast.start_time == target_start_time,
            WindForecast.publish_time <= target_start_time,
        )
        .order_by(WindForecast.publish_time.asc())
    ).all()

    return [
        ForecastPoint(
            start_time=st,
            publish_time=pt,
            generation=round(gen, 1),
        )
        for st, pt, gen in rows
    ]


def calculate_january_analytics(
    db,
    policy: DayAheadPolicy = DEFAULT_POLICY,
) -> tuple[AccuracyMetrics, list[DailyAccuracy], DataQuality]:
    """
    Calculates overall January accuracy metrics, daily accuracy breakdown, and data quality stats.
    """
    # 1. Fetch all January actual generation records (WIND)
    actual_rows = db.execute(
        select(ActualGeneration.start_time, ActualGeneration.generation)
        .where(
            ActualGeneration.start_time >= JANUARY_START,
            ActualGeneration.start_time < FEBRUARY_START,
            ActualGeneration.fuel_type == "WIND",
        )
        .order_by(ActualGeneration.start_time)
    ).all()

    actual_map: dict[datetime, float] = {st: gen for st, gen in actual_rows}
    total_actual_records = len(actual_rows)

    # 2. Total forecast records in DB for January
    total_forecast_records = db.scalar(
        select(func.count(WindForecast.id)).where(
            WindForecast.start_time >= JANUARY_START,
            WindForecast.start_time < FEBRUARY_START,
        )
    ) or 0

    # 3. Retrieve day-ahead selected forecasts for January
    selected_forecasts = get_selected_forecasts_for_range(
        db,
        JANUARY_START,
        FEBRUARY_START,
        policy=policy,
    )

    # 4. Align by exact timestamp: forecast.start_time == actual.start_time
    all_errors: list[float] = []
    daily_errors_map: dict[str, list[float]] = {}

    matched_count = 0

    for st, (_, fct_gen) in selected_forecasts.items():
        if st in actual_map:
            act_gen = actual_map[st]
            # Strict definition: error = forecast - actual
            err = fct_gen - act_gen
            all_errors.append(err)
            matched_count += 1

            date_key = st.strftime("%Y-%m-%d")
            daily_errors_map.setdefault(date_key, []).append(err)

    # 5. Overall January Metrics
    overall_metrics = compute_accuracy_metrics(all_errors)

    # 6. Daily Accuracy List for all 31 days
    daily_accuracy_list: list[DailyAccuracy] = []
    cur_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)

    while cur_date <= end_date:
        d_str = cur_date.strftime("%Y-%m-%d")
        d_errors = daily_errors_map.get(d_str, [])
        d_metrics = compute_accuracy_metrics(d_errors)
        daily_accuracy_list.append(
            DailyAccuracy(
                date=d_str,
                mae=d_metrics.mae,
                rmse=d_metrics.rmse,
                bias=d_metrics.bias,
            )
        )
        cur_date += timedelta(days=1)

    # 7. Data Quality Stats
    # actual_records: 1488 (48 half-hour settlement periods * 31 days)
    # forecast_records: total WINDFOR records stored for January (18080)
    # matched_records: delivery periods with both actual and forecast (744)
    # missing_actuals: actual periods missing (0)
    # missing_forecasts: actual periods with no exact timestamp forecast (1488 - 744 = 744)
    missing_actuals = max(0, 1488 - total_actual_records)
    missing_forecasts = max(0, total_actual_records - matched_count)

    data_quality = DataQuality(
        actual_records=total_actual_records,
        forecast_records=total_forecast_records,
        matched_records=matched_count,
        missing_actuals=missing_actuals,
        missing_forecasts=missing_forecasts,
    )

    return overall_metrics, daily_accuracy_list, data_quality


def build_dashboard_response(
    db,
    selected_date_str: str = "2026-01-14",
    target_hour: int = 14,
    policy: DayAheadPolicy = DEFAULT_POLICY,
) -> DashboardResponse:
    """
    Builds the full DashboardResponse for the specified delivery date.
    """
    try:
        sel_date = date.fromisoformat(selected_date_str)
    except ValueError:
        raise ValueError(f"Invalid date format '{selected_date_str}'. Use 'YYYY-MM-DD'.")

    if sel_date < date(2026, 1, 1) or sel_date > date(2026, 1, 31):
        raise ValueError(f"Date '{selected_date_str}' is out of range. January 2026 required (2026-01-01 to 2026-01-31).")

    day_start = datetime.combine(sel_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)

    # 1. Latest available forecast for each period on the day
    latest_forecast = get_latest_forecasts_for_day(db, day_start, day_end)

    # 2. Selected Day-Ahead forecasts for the day
    day_selected_fcts = get_selected_forecasts_for_range(
        db, day_start, day_end, policy=policy
    )

    # 3. Actuals for the day
    actual_rows = db.execute(
        select(ActualGeneration.start_time, ActualGeneration.generation)
        .where(
            ActualGeneration.start_time >= day_start,
            ActualGeneration.start_time < day_end,
            ActualGeneration.fuel_type == "WIND",
        )
        .order_by(ActualGeneration.start_time)
    ).all()
    actual_map = {st: gen for st, gen in actual_rows}

    # 4. Forecast vs Actual points (matched on timestamp)
    forecast_vs_actual: list[ForecastActualPoint] = []
    for st in sorted(day_selected_fcts.keys()):
        if st in actual_map:
            fct_gen = day_selected_fcts[st][1]
            act_gen = actual_map[st]
            # error = forecast - actual
            err = fct_gen - act_gen
            forecast_vs_actual.append(
                ForecastActualPoint(
                    start_time=st,
                    forecast=round(fct_gen, 1),
                    actual=round(act_gen, 1),
                    error=round(err, 1),
                )
            )

    # 5. Forecast Evolution for target period on this day (e.g. 14:00 UTC)
    target_period = day_start + timedelta(hours=target_hour)
    forecast_evolution = get_forecast_evolution_for_target(db, target_period)

    # 6. Overall January metrics, daily accuracy, and data quality
    overall_metrics, daily_accuracy, data_quality = calculate_january_analytics(
        db, policy=policy
    )

    return DashboardResponse(
        date=selected_date_str,
        latest_forecast=latest_forecast,
        forecast_vs_actual=forecast_vs_actual,
        forecast_evolution=forecast_evolution,
        metrics=overall_metrics,
        daily_accuracy=daily_accuracy,
        data_quality=data_quality,
    )
