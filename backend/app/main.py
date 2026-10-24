import logging
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .analytics import build_dashboard_response
from .database import get_db, init_db
from .models import ActualGeneration, WindForecast
from .schemas import DashboardResponse

logger = logging.getLogger("wind_forecast_api")

app = FastAPI(
    title="Wind Forecast Intelligence API",
    description="Elexon BMRS National Wind Generation Forecast & Accuracy Evaluation for January 2026",
    version="1.0.0",
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def read_root():
    return {
        "service": "Wind Forecast Intelligence API",
        "period": "January 2026",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "dashboard": "/dashboard?date=2026-01-14",
            "docs": "/docs",
        },
    }


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check(db: Session = Depends(get_db)):
    """
    Health check confirming backend status and database connectivity.
    """
    try:
        actual_count = db.scalar(select(func.count(ActualGeneration.id))) or 0
        forecast_count = db.scalar(select(func.count(WindForecast.id))) or 0
        return {
            "status": "ok",
            "database": "connected",
            "january_records": {
                "actuals": actual_count,
                "forecasts": forecast_count,
            },
        }
    except Exception as e:
        logger.error(f"Health check database failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connectivity check failed.",
        )


@app.get(
    "/dashboard",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
)
def get_dashboard(
    date: str = Query(
        default="2026-01-14",
        description="Target delivery date in January 2026 (format: YYYY-MM-DD)",
        examples=["2026-01-14"],
    ),
    target_hour: Optional[int] = Query(
        default=14,
        ge=0,
        le=23,
        description="Target delivery hour (0-23 UTC) for forecast evolution tracking",
    ),
    policy: Optional[str] = Query(
        default=None,
        description="Forecast cutoff policy: 'D_MINUS_1_1700' (default assumption), 'D_MINUS_1_2359', or 'LATEST_PRE_DELIVERY'",
    ),
    db: Session = Depends(get_db),
):
    """
    Returns the complete decision-support dataset for the selected delivery date:
    - Latest available forecasts
    - Day-ahead forecast vs actual generation series
    - Multi-run forecast evolution
    - January quantitative accuracy metrics (MAE, RMSE, Bias)
    - 31-day daily accuracy breakdown
    - Elexon data quality metrics
    """
    try:
        from .analytics import DEFAULT_POLICY
        return build_dashboard_response(
            db=db,
            selected_date_str=date,
            target_hour=target_hour or 14,
            policy=policy or DEFAULT_POLICY,  # type: ignore
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error in /dashboard endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating forecast analytics.",
        )