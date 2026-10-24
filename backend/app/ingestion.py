from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from .database import SessionLocal, init_db
from .elexon_client import ElexonClient
from .models import ActualGeneration, IngestionRun, WindForecast

# Target delivery period boundaries: strictly January 2026 (stored as UTC naive in SQLite)
JANUARY_START = datetime(2026, 1, 1, 0, 0, 0)
FEBRUARY_START = datetime(2026, 2, 1, 0, 0, 0)

# Forecast publication window: forecasts published from late December 2025 predict early January 2026
WINDFOR_PUBLISH_START = datetime(2025, 12, 29, 0, 0, 0, tzinfo=timezone.utc)
WINDFOR_PUBLISH_END = datetime(2026, 1, 31, 23, 59, 59, tzinfo=timezone.utc)

BATCH_SIZE = 1000


def parse_timestamp(value: str) -> datetime:
    """Convert an Elexon ISO timestamp into UTC naive datetime for SQLite storage."""
    if value.endswith("Z"):
        dt = datetime.fromisoformat(value[:-1] + "+00:00")
    else:
        dt = datetime.fromisoformat(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def ingest_actuals(
    db,
    records: list[dict],
) -> tuple[int, int, int]:
    """
    Ingest FUELHH records into actual_generation.
    Only stores fuelType='WIND' within January 2026.
    Skips duplicates idempotently based on (start_time, fuel_type).
    Returns (inserted_count, skipped_count, invalid_count).
    """
    to_insert = []
    invalid = 0
    seen = set()

    for record in records:
        if record.get("fuelType") != "WIND":
            continue

        try:
            start_time = parse_timestamp(record["startTime"])
            generation = float(record["generation"])
        except (KeyError, TypeError, ValueError):
            invalid += 1
            continue

        # Strict January 2026 boundary enforcement
        if not (JANUARY_START <= start_time < FEBRUARY_START):
            invalid += 1
            continue

        key = (start_time, "WIND")
        if key in seen:
            continue
        seen.add(key)

        to_insert.append(
            {
                "start_time": start_time,
                "generation": generation,
                "fuel_type": "WIND",
                "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
            }
        )

    if not to_insert:
        return 0, 0, invalid

    total_inserted = 0
    for i in range(0, len(to_insert), BATCH_SIZE):
        batch = to_insert[i : i + BATCH_SIZE]
        stmt = sqlite_insert(ActualGeneration).values(batch).on_conflict_do_nothing(
            index_elements=["start_time", "fuel_type"]
        )
        res = db.execute(stmt)
        if res.rowcount != -1:
            total_inserted += res.rowcount
        else:
            total_inserted += len(batch)

    skipped = len(to_insert) - total_inserted
    return total_inserted, skipped, invalid


def ingest_forecasts(
    db,
    records: list[dict],
) -> tuple[int, int, int]:
    """
    Ingest WINDFOR records into wind_forecasts.
    Only stores forecasts where delivery startTime falls within January 2026.
    Skips duplicates idempotently based on (start_time, publish_time).
    Returns (inserted_count, skipped_count, invalid_count).
    """
    to_insert = []
    invalid = 0
    seen = set()

    for record in records:
        try:
            start_time = parse_timestamp(record["startTime"])
            publish_time = parse_timestamp(record["publishTime"])
            generation = float(record["generation"])
        except (KeyError, TypeError, ValueError):
            invalid += 1
            continue

        # Strict January 2026 delivery boundary enforcement
        if not (JANUARY_START <= start_time < FEBRUARY_START):
            invalid += 1
            continue

        key = (start_time, publish_time)
        if key in seen:
            continue
        seen.add(key)

        to_insert.append(
            {
                "start_time": start_time,
                "publish_time": publish_time,
                "generation": generation,
                "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
            }
        )

    if not to_insert:
        return 0, 0, invalid

    total_inserted = 0
    for i in range(0, len(to_insert), BATCH_SIZE):
        batch = to_insert[i : i + BATCH_SIZE]
        stmt = sqlite_insert(WindForecast).values(batch).on_conflict_do_nothing(
            index_elements=["start_time", "publish_time"]
        )
        res = db.execute(stmt)
        if res.rowcount != -1:
            total_inserted += res.rowcount
        else:
            total_inserted += len(batch)

    skipped = len(to_insert) - total_inserted
    return total_inserted, skipped, invalid


def record_ingestion_run(
    db,
    dataset: str,
    period_start: datetime,
    period_end: datetime,
    record_count: int,
    status: str,
) -> None:
    db.add(
        IngestionRun(
            dataset=dataset,
            period_start=period_start,
            period_end=period_end,
            record_count=record_count,
            status=status,
        )
    )


def run_ingestion() -> dict:
    """
    Executes January 2026 ingestion for FUELHH and WINDFOR.
    Returns summary statistics.
    """
    init_db()
    client = ElexonClient()
    stats = {}

    with SessionLocal() as db:
        # ----------------------------------------------------
        # 1. FUELHH Ingestion (Actuals)
        # ----------------------------------------------------
        print("--- Ingesting FUELHH (National Wind Actuals) ---")
        try:
            actual_records = client.fetch_actuals(
                start=datetime(2026, 1, 1, tzinfo=timezone.utc),
                end=datetime(2026, 2, 1, tzinfo=timezone.utc),
                chunk_days=5,
            )
            print(f"Fetched {len(actual_records)} raw FUELHH records.")

            inserted, skipped, invalid = ingest_actuals(db, actual_records)

            record_ingestion_run(
                db,
                dataset="FUELHH",
                period_start=JANUARY_START,
                period_end=FEBRUARY_START,
                record_count=inserted,
                status="SUCCESS",
            )
            db.commit()

            stats["fuelhh_fetched"] = len(actual_records)
            stats["fuelhh_inserted"] = inserted
            stats["fuelhh_skipped"] = skipped
            stats["fuelhh_invalid"] = invalid
            print(
                f"FUELHH Ingestion Complete: inserted={inserted}, "
                f"skipped={skipped}, filtered_or_invalid={invalid}"
            )
        except Exception as e:
            db.rollback()
            print(f"FUELHH Ingestion Failed: {e}")
            try:
                record_ingestion_run(
                    db,
                    dataset="FUELHH",
                    period_start=JANUARY_START,
                    period_end=FEBRUARY_START,
                    record_count=0,
                    status="FAILED",
                )
                db.commit()
            except Exception:
                db.rollback()
            raise

        # ----------------------------------------------------
        # 2. WINDFOR Ingestion (Forecasts)
        # ----------------------------------------------------
        print("--- Ingesting WINDFOR (National Wind Forecasts) ---")
        try:
            forecast_records = client.fetch_forecasts(
                start=WINDFOR_PUBLISH_START,
                end=WINDFOR_PUBLISH_END,
                chunk_days=5,
            )
            print(f"Fetched {len(forecast_records)} raw WINDFOR records.")

            inserted, skipped, invalid = ingest_forecasts(db, forecast_records)

            record_ingestion_run(
                db,
                dataset="WINDFOR",
                period_start=JANUARY_START,
                period_end=FEBRUARY_START,
                record_count=inserted,
                status="SUCCESS",
            )
            db.commit()

            stats["windfor_fetched"] = len(forecast_records)
            stats["windfor_inserted"] = inserted
            stats["windfor_skipped"] = skipped
            stats["windfor_invalid"] = invalid
            print(
                f"WINDFOR Ingestion Complete: inserted={inserted}, "
                f"skipped={skipped}, filtered_or_invalid={invalid}"
            )
        except Exception as e:
            db.rollback()
            print(f"WINDFOR Ingestion Failed: {e}")
            try:
                record_ingestion_run(
                    db,
                    dataset="WINDFOR",
                    period_start=JANUARY_START,
                    period_end=FEBRUARY_START,
                    record_count=0,
                    status="FAILED",
                )
                db.commit()
            except Exception:
                db.rollback()
            raise

    return stats


if __name__ == "__main__":
    run_ingestion()