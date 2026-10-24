import React from "react";

export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground transition-colors duration-200">
      {/* Restrained technical ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[800px] -translate-x-1/2 opacity-10 dark:opacity-15 blur-[100px] transition-opacity"
        style={{
          background: "radial-gradient(ellipse at center, #0284c7 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle fine technical grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
};
