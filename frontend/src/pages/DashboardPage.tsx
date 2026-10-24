import React, { useState, useMemo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AppHeader } from "../components/layout/AppHeader";
import { PageContainer } from "../components/layout/PageContainer";
import { DataSourceFooter } from "../components/layout/DataSourceFooter";
import { PremiumBackground } from "../components/effects/PremiumBackground";
import { HeroSection } from "../components/dashboard/HeroSection";
import { KpiGrid } from "../components/dashboard/KpiGrid";
import { ForecastActualChart } from "../components/dashboard/ForecastActualChart";
import { ForecastEvolution } from "../components/dashboard/ForecastEvolution";
import { AccuracyMetrics } from "../components/dashboard/AccuracyMetrics";
import { AccuracyOverview } from "../components/dashboard/AccuracyOverview";
import { DataQuality } from "../components/dashboard/DataQuality";
import { useDashboard } from "../hooks/useDashboard";
import { formatPublishDateTime } from "../lib/formatters";

export const DashboardPage: React.FC = () => {
  // Default to January 14, 2026 as per specification
  const [selectedDate, setSelectedDate] = useState<string>("2026-01-14");

  // Fetch from FastAPI backend with single request lifecycle and AbortController
  const { data, isLoading, error, refetch } = useDashboard(selectedDate);

  // Compute derived statistics from live backend payload
  const {
    latestPublishTime,
    averageForecastMW,
    peakForecastMW,
    targetActualMW,
  } = useMemo(() => {
    if (!data) {
      return {
        latestPublishTime: "",
        averageForecastMW: 0,
        peakForecastMW: 0,
        targetActualMW: undefined,
      };
    }

    // Latest publish time across the day's forecast records
    let maxPubDate = 0;
    let maxPubStr = "";
    let totalMW = 0;
    let maxMW = 0;

    if (data.latest_forecast && data.latest_forecast.length > 0) {
      data.latest_forecast.forEach((f) => {
        const pubTime = new Date(f.publish_time).getTime();
        if (pubTime > maxPubDate) {
          maxPubDate = pubTime;
          maxPubStr = f.publish_time;
        }
        totalMW += f.generation;
        if (f.generation > maxMW) {
          maxMW = f.generation;
        }
      });
    }

    const avgMW = data.latest_forecast.length > 0 ? totalMW / data.latest_forecast.length : 0;

    // Find actual outturn for the target hour (14:00 UTC) for forecast evolution tracking
    let targetActual: number | undefined;
    if (data.forecast_evolution && data.forecast_evolution.length > 0 && data.forecast_vs_actual) {
      const evoTargetTime = data.forecast_evolution[0].start_time;
      const matchedRow = data.forecast_vs_actual.find(
        (r) => r.start_time === evoTargetTime
      );
      if (matchedRow) {
        targetActual = matchedRow.actual;
      }
    }

    return {
      latestPublishTime: maxPubStr ? formatPublishDateTime(maxPubStr) : "D-1 17:00 UTC",
      averageForecastMW: Math.round(avgMW),
      peakForecastMW: Math.round(maxMW),
      targetActualMW: targetActual,
    };
  }, [data]);

  const isInitialLoading = isLoading && !data;

  // Header status indicator
  const dataStatus = error
    ? "Connection error"
    : isLoading
    ? "Fetching Elexon data..."
    : `Elexon data loaded (${data?.data_quality.matched_records || 744} records)`;

  return (
    <PremiumBackground>
      <AppHeader dataStatus={dataStatus} />

      <main className="flex-1">
        <PageContainer>
          {error && !data ? (
            <div className="my-16 flex flex-col items-center justify-center rounded-[2px] border border-destructive/30 bg-destructive/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground font-mono">
                Unable to load Elexon backend data
              </h2>
              <p className="mt-1.5 max-w-md text-xs text-muted-foreground font-mono">
                {error}
              </p>
              <button
                type="button"
                onClick={refetch}
                className="mt-5 flex items-center gap-2 rounded-[2px] bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer font-mono"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry connection
              </button>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12 pb-16">
              {/* Hero & Date Controls */}
              <HeroSection
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                latestPublishTime={latestPublishTime}
                averageForecastMW={averageForecastMW}
                peakForecastMW={peakForecastMW}
              />

              {/* Strategic KPI Strip */}
              <KpiGrid
                averageForecastMW={averageForecastMW}
                publishTime={latestPublishTime}
                maeMW={data?.metrics.mae || 0}
                rmseMW={data?.metrics.rmse || 0}
                biasMW={data?.metrics.bias || 0}
                isLoading={isInitialLoading}
              />

              {/* Main Forecast vs Actual Chart */}
              <ForecastActualChart
                records={data?.forecast_vs_actual || []}
                selectedDate={selectedDate}
                isLoading={isInitialLoading}
              />

              {/* Side-by-side: Forecast Evolution & Quality/Semantics */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ForecastEvolution
                  evolution={data?.forecast_evolution || []}
                  targetActualMW={targetActualMW}
                  isLoading={isInitialLoading}
                />

                {data && (
                  <AccuracyMetrics
                    metrics={data.metrics}
                    dataQuality={data.data_quality}
                    isLoading={isInitialLoading}
                  />
                )}
              </div>

              {/* January 2026 Historical Daily Accuracy */}
              {data && (
                <AccuracyOverview
                  dailyRecords={data.daily_accuracy || []}
                  isLoading={isInitialLoading}
                />
              )}

              {/* Data Quality & Pipeline Integrity */}
              <DataQuality
                stats={data?.data_quality || null}
                isLoading={isInitialLoading}
              />
            </div>
          )}
        </PageContainer>
      </main>

      <DataSourceFooter />
    </PremiumBackground>
  );
};
