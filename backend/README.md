# Wind Forecast Intelligence — Backend Service

Backend service for evaluating UK national wind generation forecasts against Elexon BMRS settlement outturns for **January 2026**.

---

## 1. Architecture Overview

```text
                 Elexon BMRS
             (FUELHH & WINDFOR)
                     │
                     │ Controlled stream ingestion
                     ▼
          SQLite Database (Local)
        (backend/data/wind_forecast.db)
                     │
                     │ Strict timestamp alignment & metrics
                     ▼
              Analytics Engine
             (app/analytics.py)
                     │
                     ▼
                FastAPI API
              (app/main.py)
                     │
                     ▼
           React Frontend Dashboard
```

- **Database**: SQLite (`backend/data/wind_forecast.db`).
- **No external dependencies**: Pure Python 3.13 + FastAPI + SQLAlchemy + httpx.
- **Source of Truth**: Local SQLite database populated via idempotent ingestion against challenge-specified Elexon BMRS stream endpoints.

---

## 2. Quickstart & Execution

### 2.1 Dependencies & Environment
Using `uv`:
```bash
cd backend
uv sync
```
Or with standard virtualenv:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # or uv pip install -e .
```

### 2.2 Initialize Schema & Run Ingestion
```bash
# Ingest all January 2026 FUELHH and WINDFOR data
uv run python -m app.ingestion
```

### 2.3 Run Verification Test Suite
```bash
uv run python tests/test_backend_suite.py
```

### 2.4 Start the FastAPI Server
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. API Endpoints

### `GET /health`
Returns service status, database connectivity, and record counts.
```json
{
  "status": "ok",
  "database": "connected",
  "january_records": {
    "actuals": 1488,
    "forecasts": 18080
  }
}
```

### `GET /dashboard?date=2026-01-14&target_hour=14`
Returns the decision-support payload for the selected delivery date:
* **Query Parameters**:
  * `date` (string, required): Delivery date in January 2026 (`YYYY-MM-DD`, default `2026-01-14`).
  * `target_hour` (integer, optional): Hour in UTC (0–23, default `14`) for forecast evolution tracking.
* **Response Body**:
  * `date`: Target delivery date.
  * `latest_forecast`: Latest available forecast points published for each delivery period on that day.
  * `forecast_vs_actual`: Aligned actual vs day-ahead forecast points with error values.
  * `forecast_evolution`: Sequential publication runs for the target delivery hour converging onto delivery.
  * `metrics`: Overall January accuracy (`mae`, `rmse`, `bias`).
  * `daily_accuracy`: Daily accuracy breakdown for all 31 days in January 2026.
  * `data_quality`: Record counts, matched periods, and missing data audits.

---

## 4. Business Methodology & Core Assumptions

### 4.1 Day-Ahead Forecast Cutoff (Implementation Assumption)
* **Challenge Specification Check**: The Gridbricks challenge materials **do NOT explicitly specify** a cutoff horizon such as $D-1\text{ 17:00 UTC}$. Therefore, 17:00 UTC is treated as an **implementation assumption** rather than a challenge requirement.
* **Rationale for Assumption**: In the UK power market (Elexon BMRS), day-ahead indicative generation schedules are submitted around **17:00 UTC on $D-1$** (7 hours before the delivery day starts).
* **Configurability**: The selection policy is explicitly configurable via the `DAY_AHEAD_POLICY` environment variable or the `?policy=` query parameter on `/dashboard`:
  * `"D_MINUS_1_1700"` (Default assumption): Latest forecast published on or before $D-1\text{ 17:00 UTC}$ (`publish_time <= delivery_day_start - 7h`).
  * `"D_MINUS_1_2359"`: Latest forecast published before the delivery day begins (`publish_time < delivery_day_start`).
  * `"LATEST_PRE_DELIVERY"`: Latest forecast published prior to delivery period start (`publish_time <= start_time`).
* Across all 744 hourly delivery periods in January 2026, **100% (744/744)** have a valid forecast available under all three cutoff rules.

### 4.2 Native Resolution & Timestamp Alignment
* **Resolution Differences Verified**:
  * `FUELHH` (actual generation) is **half-hourly** (`:00` and `:30`), yielding **1,488 records** across January 2026 (744 at `:00`, 744 at `:30`).
  * `WINDFOR` (forecast generation) natively publishes on **hourly boundaries** (`:00`).
* **Evaluation Semantics**: Accuracy is evaluated strictly at WINDFOR's native hourly resolution (`actual.start_time == forecast.start_time`).
* **No Artificial Values**: Values for `:30` settlement periods are **not invented, interpolated, or forward-filled**. Instead, they are transparently audited in data quality as `missing_forecasts = 744`.

### 4.3 Error Semantics
* `Error = Forecast − Actual`
* `MAE = mean(|Forecast − Actual|)`
* `RMSE = sqrt(mean((Forecast − Actual)²))`
* `Bias = mean(Forecast − Actual)`
* **Interpretation**:
  * $\text{Bias} > 0$: Forecast was higher than actual generation (**Over-forecasting**).
  * $\text{Bias} < 0$: Actual generation was higher than forecast (**Under-forecasting**).

### 4.4 Data Quality Audit
* `actual_records`: **1,488** (31 days × 48 settlement periods).
* `forecast_records`: **18,080** (All WINDFOR runs published for January delivery periods).
* `matched_records`: **744** (Delivery periods evaluated with exact timestamp match).
* `missing_actuals`: **0** (Zero missing settlement outturns in January 2026).
* `missing_forecasts`: **744** (The `:30` settlement periods for which Elexon publishes no hourly forecast).
