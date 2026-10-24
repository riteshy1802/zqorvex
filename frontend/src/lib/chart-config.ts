/**
 * Centralized Chart Styling & Color Tokens for Recharts
 * Follows the Bloomberg Terminal × Fintech theme guidelines
 */

export const CHART_THEME = {
  forecast: {
    stroke: "#38BDF8", // Cyan-400 in dark / Sky-500 in light
    fill: "rgba(56, 189, 248, 0.08)",
    label: "Forecast (WINDFOR)",
  },
  actual: {
    stroke: "#F8FAFC", // Pure Light Slate in dark / Slate-900 in light
    fill: "rgba(248, 250, 252, 0.04)",
    label: "Actual Generation (FUELHH)",
  },
  error: {
    positive: "#10B981", // Emerald-500: Actual > Forecast (Under-forecasted)
    negative: "#F43F5E", // Rose-500: Forecast > Actual (Over-forecasted)
    muted: "#64748B",
  },
  grid: {
    stroke: "var(--border)",
    strokeOpacity: 0.4,
    strokeDasharray: "3 3",
  },
  axis: {
    stroke: "var(--border)",
    tick: {
      fill: "var(--text-muted)",
      fontSize: 11,
      fontFamily: "var(--font-sans)",
    },
  },
};
