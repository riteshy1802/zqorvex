from datetime import datetime, timedelta

import httpx


BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

# One-day chunks keep requests predictable.
CHUNK_SIZE = timedelta(days=1)


class ElexonClient:
    def __init__(self, timeout: float = 30.0):
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
    ) -> list[dict]:
        records = []

        current_start = start

        with httpx.Client(timeout=self.timeout) as client:
            while current_start < end:
                current_end = min(
                    current_start + CHUNK_SIZE,
                    end,
                )

                print(
                    "Fetching FUELHH: "
                    f"{current_start.isoformat()} → "
                    f"{current_end.isoformat()}"
                )

                url = f"{BASE_URL}/FUELHH/stream"

                params = {
                    "settlementDateFrom": current_start.date().isoformat(),
                    "settlementDateTo": current_end.date().isoformat(),
                    "fuelType": "WIND",
                }

                chunk = self._fetch(
                    client,
                    url,
                    params,
                )

                records.extend(chunk)

                current_start = current_end

        return records

    def fetch_forecasts(
        self,
        start: datetime,
        end: datetime,
    ) -> list[dict]:
        records = []

        current_start = start

        with httpx.Client(timeout=self.timeout) as client:
            while current_start < end:
                current_end = min(
                    current_start + CHUNK_SIZE,
                    end,
                )

                print(
                    "Fetching WINDFOR: "
                    f"{current_start.isoformat()} → "
                    f"{current_end.isoformat()}"
                )

                url = f"{BASE_URL}/WINDFOR/stream"

                params = {
                    "publishDateTimeFrom": (
                        current_start.isoformat()
                        .replace("+00:00", "Z")
                    ),
                    "publishDateTimeTo": (
                        current_end.isoformat()
                        .replace("+00:00", "Z")
                    ),
                }

                chunk = self._fetch(
                    client,
                    url,
                    params,
                )

                records.extend(chunk)

                current_start = current_end

        return records