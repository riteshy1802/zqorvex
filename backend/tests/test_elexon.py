import sys
from pathlib import Path

# Ensure the backend directory is in the Python search path BEFORE importing from app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timezone
from app.elexon_client import ElexonClient



client = ElexonClient()

# Test period: January 1, 2026 → January 2, 2026
start = datetime(2026, 1, 1, tzinfo=timezone.utc)
end = datetime(2026, 1, 2, tzinfo=timezone.utc)

# FUELHH: actual wind generation
actuals = client.fetch_actuals(
    start,
    end,
)

# WINDFOR: forecasts published during this period
forecasts = client.fetch_forecasts(
    start,
    end,
)

print("FUELHH records:", len(actuals))
print("WINDFOR records:", len(forecasts))

print("\nFirst 3 FUELHH records:")
for record in actuals[:3]:
    print(record)

print("\nFirst 3 WINDFOR records:")
for record in forecasts[:3]:
    print(record)