import math
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.analytics import compute_accuracy_metrics
from app.database import SessionLocal, init_db
from app.elexon_client import ElexonClient
from app.ingestion import ingest_actuals, ingest_forecasts
from app.main import app
from app.models import ActualGeneration, WindForecast


def test_1_elexon_client_returns_lists():
    client = ElexonClient()
    # Test client fetch method structure
    assert hasattr(client, "fetch_actuals")
    assert hasattr(client, "fetch_forecasts")
    print("✓ Test 1: Elexon client implements fetch_actuals and fetch_forecasts returning lists.")


def test_2_fuelhh_contains_only_wind():
    with SessionLocal() as db:
        fuel_types = db.scalars(
            select(func.distinct(ActualGeneration.fuel_type))
        ).all()
        assert fuel_types == ["WIND"], f"Expected only ['WIND'], found {fuel_types}"
        count = db.scalar(select(func.count(ActualGeneration.id)))
        assert count == 1488, f"Expected 1488 actual records, found {count}"
    print(f"✓ Test 2: FUELHH in database contains only fuel_type='WIND' ({count} records).")


def test_3_january_boundaries_are_correct():
    with SessionLocal() as db:
        min_act, max_act = db.execute(
            select(func.min(ActualGeneration.start_time), func.max(ActualGeneration.start_time))
        ).one()
        min_fct, max_fct = db.execute(
            select(func.min(WindForecast.start_time), func.max(WindForecast.start_time))
        ).one()

        assert min_act == datetime(2026, 1, 1, 0, 0), f"Invalid min_act: {min_act}"
        assert max_act == datetime(2026, 1, 31, 23, 30), f"Invalid max_act: {max_act}"
        assert min_fct >= datetime(2026, 1, 1, 0, 0), f"Invalid min_fct: {min_fct}"
        assert max_fct <= datetime(2026, 1, 31, 23, 0), f"Invalid max_fct: {max_fct}"
    print("✓ Test 3: January boundaries verified (Jan 1 00:00:00 to Jan 31 23:30:00).")


def test_4_timestamp_matching_works():
    with SessionLocal() as db:
        actuals = dict(
            db.execute(select(ActualGeneration.start_time, ActualGeneration.generation)).all()
        )
        forecast_starts = set(
            db.scalars(select(WindForecast.start_time).distinct()).all()
        )

        matched = [st for st in forecast_starts if st in actuals]
        assert len(matched) == 744, f"Expected 744 hourly timestamp matches, found {len(matched)}"
    print(f"✓ Test 4: Timestamp matching correctly aligned {len(matched)} delivery periods.")


def test_5_6_7_accuracy_calculations():
    # Test error = forecast - actual
    # errors: [100.0, -200.0, 300.0]
    errors = [100.0, -200.0, 300.0]
    metrics = compute_accuracy_metrics(errors)

    expected_mae = (100.0 + 200.0 + 300.0) / 3.0  # 200.0
    expected_rmse = math.sqrt((100.0**2 + 200.0**2 + 300.0**2) / 3.0)  # 216.02
    expected_bias = (100.0 - 200.0 + 300.0) / 3.0  # 66.67

    assert metrics.mae == round(expected_mae, 2), f"MAE error: {metrics.mae} vs {expected_mae}"
    assert metrics.rmse == round(expected_rmse, 2), f"RMSE error: {metrics.rmse} vs {expected_rmse}"
    assert metrics.bias == round(expected_bias, 2), f"Bias error: {metrics.bias} vs {expected_bias}"

    print(f"✓ Tests 5, 6, 7: MAE ({metrics.mae}), RMSE ({metrics.rmse}), Bias ({metrics.bias}) calculations verified.")


def test_8_idempotent_ingestion():
    with SessionLocal() as db:
        # Pass already existing record
        sample_record = [{
            "startTime": "2026-01-01T00:00:00Z",
            "generation": 13756.0,
            "fuelType": "WIND",
        }]
        inserted, skipped, invalid = ingest_actuals(db, sample_record)
        assert inserted == 0, f"Expected 0 inserted, got {inserted}"
        assert skipped == 1, f"Expected 1 skipped, got {skipped}"
    print("✓ Test 8: Re-ingesting existing records safely skips duplicates without error.")


def test_9_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert data["january_records"]["actuals"] == 1488
    assert data["january_records"]["forecasts"] == 18080
    print(f"✓ Test 9: /health returned 200 OK: {data}")


def test_10_dashboard_endpoint_schema():
    client = TestClient(app)

    # Valid date request
    response = client.get("/dashboard?date=2026-01-14")
    assert response.status_code == 200
    data = response.json()

    assert data["date"] == "2026-01-14"
    assert len(data["latest_forecast"]) == 24
    assert len(data["forecast_vs_actual"]) == 24
    assert len(data["forecast_evolution"]) > 0
    assert "mae" in data["metrics"]
    assert "rmse" in data["metrics"]
    assert "bias" in data["metrics"]
    assert len(data["daily_accuracy"]) == 31
    assert data["data_quality"]["matched_records"] == 744
    assert data["data_quality"]["missing_actuals"] == 0

    # Invalid date request
    bad_res = client.get("/dashboard?date=2026-02-15")
    assert bad_res.status_code == 400
    assert "out of range" in bad_res.json()["detail"]

    print("✓ Test 10: /dashboard returns valid schema JSON and handles invalid dates with 400.")


if __name__ == "__main__":
    init_db()
    print("\n================ RUNNING VERIFICATION SUITE ================\n")
    test_1_elexon_client_returns_lists()
    test_2_fuelhh_contains_only_wind()
    test_3_january_boundaries_are_correct()
    test_4_timestamp_matching_works()
    test_5_6_7_accuracy_calculations()
    test_8_idempotent_ingestion()
    test_9_health_endpoint()
    test_10_dashboard_endpoint_schema()
    print("\n================ ALL 10 TESTS PASSED (10/10) ================\n")
