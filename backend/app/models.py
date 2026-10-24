from datetime import datetime

from sqlalchemy import DateTime, Float, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base

class ActualGeneration(Base):
    __tablename__ = "actual_generation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    generation: Mapped[float] = mapped_column(Float, nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(20), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "start_time",
            "fuel_type",
            name="uq_actual_start_time_fuel_type",
        ),
        Index("ix_actual_generation_start_time", "start_time"),
    )


class WindForecast(Base):
    __tablename__ = "wind_forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    publish_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    generation: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "start_time",
            "publish_time",
            name="uq_forecast_start_time_publish_time",
        ),
        Index("ix_wind_forecasts_start_time", "start_time"),
        Index("ix_wind_forecasts_publish_time", "publish_time"),
    )


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    dataset: Mapped[str] = mapped_column(String(20), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    record_count: Mapped[int] = mapped_column(Integer, nullable=False)

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(String(20), nullable=False)