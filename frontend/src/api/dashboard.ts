import { DashboardResponse, HealthResponse } from "../types/dashboard";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
    ? ""
    : "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Fetch the complete dashboard payload for the specified January 2026 delivery date.
 * AbortSignal is passed to ensure any in-flight requests are cleanly aborted if the user changes date.
 */
export async function fetchDashboard(
  date: string,
  signal?: AbortSignal,
  targetHour: number = 14,
  policy?: string
): Promise<DashboardResponse> {
  const params = new URLSearchParams({
    date,
    target_hour: targetHour.toString(),
  });

  if (policy) {
    params.set("policy", policy);
  }

  const url = `${API_BASE_URL}/dashboard?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Non-JSON error body
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Fetch backend and database health status.
 */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/health`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json();
}
