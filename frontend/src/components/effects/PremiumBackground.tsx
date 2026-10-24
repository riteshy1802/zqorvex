import React from "react";

export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Subtle radial ambient illumination behind hero */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 dark:opacity-25 blur-[120px] transition-opacity duration-700"
        style={{
          background: "radial-gradient(ellipse at center, #0284c7 0%, #0369a1 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Secondary soft amber/cyan fill */}
      <div
        className="pointer-events-none absolute top-[450px] right-[-100px] h-[400px] w-[500px] rounded-full opacity-10 dark:opacity-15 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Fine technical grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
};
