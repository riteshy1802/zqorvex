# Wind Forecast Intelligence

A decision-support dashboard built for an energy trading desk to evaluate UK national wind generation forecasts against actual settlement outturns for **January 2026**.

The application tracks:
1. **Latest Wind Generation Forecasts**: Day-ahead national forecast volumes and multi-run publication revisions (`WINDFOR`).
2. **Forecast Accuracy & Bias**: Quantitative evaluation (MAE, RMSE, Bias) against Elexon national wind outturns (`FUELHH`).

---

## 🚀 Quickstart

The SQLite database (`backend/data/wind_forecast.db`) is already **pre-seeded with all January 2026 data** (1,488 actuals, 18,080 forecast revisions), so the product runs immediately without waiting for ingestion.

### Option 1: Docker Compose (Recommended)

Start both backend and frontend services with a single command from the project root:

```bash
docker compose up --build
```

#### Where to access the application:
- **Frontend Dashboard**: Open your browser at [http://localhost:5173](http://localhost:5173)
- **Backend Interactive API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

#### Helpful Docker commands:
```bash
# Run tests inside the running backend container:
docker compose exec backend python tests/test_backend_suite.py

# Run Elexon ingestion inside the running backend container:
docker compose exec backend python -m app.ingestion

# Stop the containers:
docker compose down
```

---

### Option 2: Vercel Monorepo (Services)

Both frontend and backend deploy together in sync as a single Vercel project under one shared domain:
- Monorepo services configured via root [`vercel.json`](file:///home/ritesh/Desktop/zqorvex/vercel.json).
- Import the repository on Vercel (leave **Root Directory** as repository root).
- Vercel automatically deploys both `frontend` (Vite) and `backend` (FastAPI), proxying `/dashboard`, `/health`, and `/docs` to FastAPI without CORS issues.

---

### Option 3: Local Development

#### 1. Backend (FastAPI + Python 3.11+)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt  # or: uv sync

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install  # or: pnpm install

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 📥 Data Ingestion (Optional)

To refresh or re-ingest all January 2026 Elexon data from scratch:

```bash
cd backend
python -m app.ingestion
```

This queries Elexon BMRS streaming endpoints (`/datasets/FUELHH/stream` and `/datasets/WINDFOR/stream`) in controlled chunks and idempotently upserts the records into SQLite.

---

## 🧪 Testing & Verification

Run the automated backend test suite:

```bash
cd backend
python tests/test_backend_suite.py
```

Run frontend linting and production build:

```bash
cd frontend
npm run lint
npm run build
```

---

## 📊 Core Methodology

- **Data Sources**: Official Elexon BMRS APIs only (`FUELHH` for actual wind generation, `WINDFOR` for wind forecasts).
- **Native Hourly Resolution**: `FUELHH` is half-hourly (1,488 records) while `WINDFOR` publishes on hourly boundaries (744 distinct delivery periods). Accuracy is evaluated strictly at the native hourly resolution ($N = 744$ matched periods). Values for `:30` periods are never artificially invented or interpolated.
- **Day-Ahead Cutoff Policy**: Uses the industry-standard $D-1\text{ 17:00 UTC}$ indicative gate as an implementation assumption. Configurable via `DAY_AHEAD_POLICY` environment variable or `?policy=` query parameter (`D_MINUS_1_1700`, `D_MINUS_1_2359`, `LATEST_PRE_DELIVERY`).
- **Mathematical Accuracy**:
  - $\text{Error} = \text{Forecast} - \text{Actual}$
  - $\text{MAE} = 1,968.25\text{ MW}$ ($1.97\text{ GW}$)
  - $\text{RMSE} = 2,434.74\text{ MW}$ ($2.43\text{ GW}$)
  - $\text{Bias} = +1,816.53\text{ MW}$ ($+1.82\text{ GW}$ over-forecasting tendency)

## Note :
FUELHH provides half-hourly actual generation, while WINDFOR provides hourly forecasts. Forecast accuracy is therefore evaluated at WINDFOR's native hourly delivery resolution using the corresponding FUELHH hourly actuals, without interpolation.

## 🤖 AI Disclosure & Engineering Process

- **Domain Research & Ideation**: **ChatGPT (web)** was used to brainstorm problem nuances and clarify challenge requirements. **Google Search** was used to research electricity market fundamentals—understanding Day-Ahead Markets (DAM), Forward contracts, renewable volume intermittency, and why trading desks balance short-term positions on the DAM even when long-term forward hedges exist.
- **Product & KPI Formulation**: After framing this commercial utility context, we defined the essential decision-support KPIs required by power traders on the terminal (Latest Day-Ahead Forecast Volume, MAE, RMSE, Directional Forecast Bias, and multi-publish Forecast Evolution).
- **Code Scaffolding & Implementation**: **Google Antigravity** was used as an AI pair-programming assistant to scaffold frontend UI components (Tailwind CSS, Recharts visual system) and build the backend FastAPI/SQLAlchemy service.
- **Verification & Ownership**: All system architecture, Elexon BMRS endpoint contracts, database schemas, timestamp matching, and mathematical formulations were planned and validated through isolated out-of-repo prototype tests before implementation, and all final deliverables were verified against independent mathematical proofs and automated test suites.
