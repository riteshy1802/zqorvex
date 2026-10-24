import React, { useState } from "react";
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
import { useForecastData } from "../hooks/useForecastData";
import { useAccuracyMetrics } from "../hooks/useAccuracyMetrics";

export const DashboardPage: React.FC = () => {
  // Default January 14, 2026 as per specification
  const [selectedDate, setSelectedDate] = useState<string>("2026-01-14");

  const {
    data: dayForecast,
    evolution,
    isLoading: forecastLoading,
    error: forecastError,
  } = useForecastData(selectedDate);

  const {
    analytics,
    dataQuality,
    isLoading: metricsLoading,
    error: metricsError,
  } = useAccuracyMetrics();

  const isInitialLoading = forecastLoading && !dayForecast;
  const hasError = forecastError || metricsError;

  return (
    <PremiumBackground>
      <AppHeader dataStatus="Elexon data loaded" />

      <main className="flex-1">
        <PageContainer>
          {hasError ? (
            <div className="my-16 flex flex-col items-center justify-center rounded-[2px] border border-destructive/30 bg-destructive/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground font-mono">
                Unable to load Elexon data
              </h2>
              <p className="mt-1.5 max-w-md text-xs text-muted-foreground">
                {forecastError || metricsError || "We couldn't retrieve the requested forecast data for this period."}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
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
                latestPublishTime={dayForecast?.latestPublishTime || "06:00 UTC"}
                latestForecastGW={dayForecast?.latestForecastGW || 18.4}
              />

              {/* Strategic KPI Strip */}
              <KpiGrid
                latestForecastGW={dayForecast?.latestForecastGW || 18.4}
                publishTime={dayForecast?.latestPublishTime || "06:00 UTC"}
                maeGW={dayForecast?.dailyMAE_GW || analytics?.summary.maeGW || 1.28}
                rmseGW={dayForecast?.dailyRMSE_GW || analytics?.summary.rmseGW || 1.76}
                biasGW={dayForecast?.dailyBias_GW ?? analytics?.summary.biasGW ?? 0.21}
                isLoading={isInitialLoading}
              />

              {/* Main Forecast vs Actual Chart */}
              <ForecastActualChart
                records={dayForecast?.records || []}
                selectedDate={selectedDate}
                isLoading={forecastLoading}
              />

              {/* Side-by-side: Forecast Evolution & Quality/Semantics */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ForecastEvolution
                  evolution={evolution}
                  isLoading={forecastLoading}
                />

                {analytics && (
                  <AccuracyMetrics
                    summary={analytics.summary}
                    isLoading={metricsLoading}
                  />
                )}
              </div>

              {/* January 2026 Historical Accuracy */}
              {analytics && (
                <AccuracyOverview
                  dailyRecords={analytics.dailyRecords}
                  isLoading={metricsLoading}
                />
              )}

              {/* Data Quality & Pipeline Integrity */}
              <DataQuality
                stats={dataQuality}
                isLoading={metricsLoading}
              />
            </div>
          )}
        </PageContainer>
      </main>

      <DataSourceFooter />
    </PremiumBackground>
  );
};
