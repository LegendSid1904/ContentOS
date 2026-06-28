"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="crt-monitor relative crt-brackets max-w-lg mx-auto mt-12">
      <div className="crt-scanlines" />
      <div className="crt-grain" />
      <div className="crt-vignette" />
      <div className="crt-sweep" />

      <div className="crt-micro-tl">
        <span className="font-mono text-[11px] tracking-wider text-err/80">err</span>
        <span className="text-tx-4">|</span>
        <span className="font-mono text-[11px] tracking-wider">fatal</span>
      </div>

      <div className="crt-monitor-header">
        <span className="w-2 h-2 rounded-full bg-err animate-beat-pulse" />
        <span className="font-mono text-[13px] font-semibold text-err ml-2">SYSTEM_ERROR</span>
      </div>

      <div className="crt-monitor-content p-6 space-y-4">
        <div className="font-mono text-[12px] text-err/80 leading-relaxed">
          <span className="text-err">[ERROR]</span> {error.message || "An unexpected error occurred"}
        </div>

        {error.digest && (
          <div className="font-mono text-[10px] text-tx-4 tracking-wider">
            digest: {error.digest}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
          <button onClick={reset} className="btn-terminal">
            {"[RETRY]"}
          </button>
          <Link href="/dashboard" className="btn-terminal">
            {"[HOME]"}
          </Link>
        </div>
      </div>

      <div className="crt-micro-bl">
        <span className="font-mono text-[11px] tracking-wider text-err/60">system_error</span>
      </div>
      <div className="crt-micro-br">
        <span className="font-mono text-[11px] tracking-wider text-tx-4">recoverable</span>
      </div>
    </div>
  );
}
