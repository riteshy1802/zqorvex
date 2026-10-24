    #              ingest_january_2026()
    #                      │
    #          ┌───────────┴───────────┐
    #          ↓                       ↓
    #       FUELHH                  WINDFOR
    #          │                       │
    #    already_ingested?       already_ingested?
    #       │       │                 │       │
    #      YES      NO               YES      NO
    #       │       │                 │       │
    #     skip    fetch             skip    fetch
    #               ↓                         ↓
    #           process                   process
    #               ↓                         ↓
    #             SQLite                   SQLite
from datetime import datetime, timezone

from sqlalchemy import select

from .database import SessionLocal
from .elexon_client import ElexonClient
from .models import ActualGeneration, IngestionRun, WindForecast


JANUARY_START = datetime(2026, 1, 1, tzinfo=timezone.utc)
FEBRUARY_START = datetime(2026, 2, 1, tzinfo=timezone.utc)


def parse_timestamp(value: str) -> datetime:
    """Convert an Elexon ISO timestamp into a timezone-aware datetime."""
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def ingest_actuals(
    db,
    records: list[dict],
) -> tuple[int, int]:
    inserted = 0
    invalid = 0

    for record in records:
        if record.get("fuelType") != "WIND":
            continue

        try:
            start_time = parse_timestamp(record["startTime"])
            generation = float(record["generation"])
        except (KeyError, TypeError, ValueError):
            invalid += 1
            continue

        existing = db.scalar(
            select(ActualGeneration).where(
                ActualGeneration.start_time == start_time,
                ActualGeneration.fuel_type == "WIND",
            )
        )

        if existing:
            continue

        db.add(
            ActualGeneration(
                start_time=start_time,
                generation=generation,
                fuel_type="WIND",
            )
        )

        inserted += 1

    return inserted, invalid


def ingest_forecasts(
    db,
    records: list[dict],
) -> tuple[int, int]:
    inserted = 0
    invalid = 0

    for record in records:
        try:
            start_time = parse_timestamp(record["startTime"])
            publish_time = parse_timestamp(record["publishTime"])
            generation = float(record["generation"])
        except (KeyError, TypeError, ValueError):
            invalid += 1
            continue

        existing = db.scalar(
            select(WindForecast).where(
                WindForecast.start_time == start_time,
                WindForecast.publish_time == publish_time,
            )
        )

        if existing:
            continue

        db.add(
            WindForecast(
                start_time=start_time,
                publish_time=publish_time,
                generation=generation,
            )
        )

        inserted += 1

    return inserted, invalid


def record_ingestion_run(
    db,
    dataset: str,
    record_count: int,
    status: str,
) -> None:
    db.add(
        IngestionRun(
            dataset=dataset,
            period_start=JANUARY_START,
            period_end=FEBRUARY_START,
            record_count=record_count,
            status=status,
        )
    )


def already_ingested(db, dataset: str) -> bool:
    run = db.scalar(
        select(IngestionRun)
        .where(
            IngestionRun.dataset == dataset,
            IngestionRun.period_start == JANUARY_START,
            IngestionRun.period_end == FEBRUARY_START,
            IngestionRun.status == "SUCCESS",
        )
        .order_by(IngestionRun.fetched_at.desc())
    )

    return run is not None


def ingest_january_2026() -> None:
    client = ElexonClient()

    with SessionLocal() as db:

        # -------------------------
        # FUELHH
        # -------------------------
        if already_ingested(db, "FUELHH"):
            print(
                "FUELHH January 2026 data already ingested. "
                "Skipping fetch."
            )
        else:
            try:
                print("Fetching FUELHH data...")

                actual_records = client.fetch_actuals(
                    JANUARY_START,
                    FEBRUARY_START,
                )

                print(
                    f"Received {len(actual_records)} FUELHH records."
                )

                actual_inserted, actual_invalid = ingest_actuals(
                    db,
                    actual_records,
                )

                record_ingestion_run(
                    db,
                    dataset="FUELHH",
                    record_count=actual_inserted,
                    status="SUCCESS",
                )

                db.commit()

                print(
                    f"FUELHH: inserted={actual_inserted}, "
                    f"invalid={actual_invalid}"
                )

            except Exception:
                db.rollback()
                record_ingestion_run(
                    db,
                    dataset="FUELHH",
                    record_count=0,
                    status="FAILED",
                )
                db.commit()
                raise

        # -------------------------
        # WINDFOR
        # -------------------------
        if already_ingested(db, "WINDFOR"):
            print(
                "WINDFOR January 2026 data already ingested. "
                "Skipping fetch."
            )
        else:
            try:
                print("Fetching WINDFOR data...")

                forecast_records = client.fetch_forecasts(
                    JANUARY_START,
                    FEBRUARY_START,
                )

                print(
                    f"Received {len(forecast_records)} WINDFOR records."
                )

                forecast_inserted, forecast_invalid = ingest_forecasts(
                    db,
                    forecast_records,
                )

                record_ingestion_run(
                    db,
                    dataset="WINDFOR",
                    record_count=forecast_inserted,
                    status="SUCCESS",
                )

                db.commit()

                print(
                    f"WINDFOR: inserted={forecast_inserted}, "
                    f"invalid={forecast_invalid}"
                )

            except Exception:
                db.rollback()
                record_ingestion_run(
                    db,
                    dataset="WINDFOR",
                    record_count=0,
                    status="FAILED",
                )
                db.commit()
                raise


if __name__ == "__main__":
    ingest_january_2026()