from datetime import datetime, timedelta, timezone
import httpx

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


class ElexonClient:
    def __init__(self, timeout: float = 45.0):
        self.timeout = timeout

    def _fetch(
        self,
        client: httpx.Client,
        url: str,
        params: dict,
    ) -> list[dict]:
        response = client.get(url, params=params)
        response.raise_for_status()

        payload = response.json()

        if isinstance(payload, dict) and "data" in payload:
            return payload["data"]

        if isinstance(payload, list):
            return payload

        raise RuntimeError(
            f"Unexpected Elexon response format: {type(payload)}"
        )

    def fetch_actuals(
        self,
        start: datetime,
        end: datetime,
        chunk_days: int = 5,
    ) -> list[dict]:
        """Fetch FUELHH records filtered to fuelType=WIND for the given date range."""
        records = []

        last_date = (end - timedelta(days=1)).date() if end.date() > start.date() else start.date()
        current_date = start.date()

        with httpx.Client(timeout=self.timeout) as client:
            while current_date <= last_date:
                chunk_end_date = min(current_date + timedelta(days=chunk_days - 1), last_date)

                print(
                    f"Fetching FUELHH: {current_date.isoformat()} → {chunk_end_date.isoformat()}"
                )

                url = f"{BASE_URL}/FUELHH/stream"
                params = {
                    "settlementDateFrom": current_date.isoformat(),
                    "settlementDateTo": chunk_end_date.isoformat(),
                    "fuelType": "WIND",
                }

                chunk = self._fetch(client, url, params)
                records.extend(chunk)

                current_date = chunk_end_date + timedelta(days=1)

        return records

    def fetch_forecasts(
        self,
        start: datetime,
        end: datetime,
        chunk_days: int = 5,
    ) -> list[dict]:
        """Fetch WINDFOR records by publishDateTime window in chunks."""
        records = []
        chunk_delta = timedelta(days=chunk_days)

        current_start = start

        with httpx.Client(timeout=self.timeout) as client:
            while current_start < end:
                current_end = min(current_start + chunk_delta, end)

                print(
                    f"Fetching WINDFOR: {current_start.isoformat()} → {current_end.isoformat()}"
                )

                url = f"{BASE_URL}/WINDFOR/stream"
                params = {
                    "publishDateTimeFrom": current_start.isoformat().replace("+00:00", "Z"),
                    "publishDateTimeTo": current_end.isoformat().replace("+00:00", "Z"),
                }

                chunk = self._fetch(client, url, params)
                records.extend(chunk)

                current_start = current_end

        return records