"use client";

import { cn } from "@/lib/utils";

interface ScanLoaderProps {
  title?: string;
  steps?: string[];
  currentStep?: number;
  className?: string;
}

export function ScanLoader({
  title = "AI is analyzing",
  steps = ["Analyzing content...", "Generating insights...", "Finalizing..."],
  currentStep = 0,
  className,
}: ScanLoaderProps) {
  return (
    <div className={cn("scan-wrap", className)}>
      <div className="scan-line" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-vi-400 animate-beat-pulse" />
        <span className="font-mono text-[11px] text-vi-300 uppercase tracking-widest">
          {title}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 text-[13px] transition-all duration-300",
              i === currentStep
                ? "text-tx-1"
                : i < currentStep
                  ? "text-tx-3"
                  : "text-tx-3/50",
            )}
          >
            <span
              className={cn(
                "w-[6px] h-[6px] rounded-full flex-shrink-0",
                i === currentStep
                  ? "bg-te-400 animate-beat-pulse"
                  : i < currentStep
                    ? "bg-ok"
                    : "bg-tx-4",
              )}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
