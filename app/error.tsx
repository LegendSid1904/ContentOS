"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <div className="bg-[#0f1011] border border-[#23252a] rounded-r2 max-w-lg w-full p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-[#ef4444] tracking-wider uppercase">System Error</span>
        </div>

        <p className="font-mono text-[12px] text-[#f0eeff] leading-relaxed mb-4">
          {error.message || "An unexpected error occurred"}
        </p>

        {error.digest && (
          <p className="font-mono text-[8px] text-[#686690] tracking-wider mb-4">
            ref: {error.digest}
          </p>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-white/[0.04]">
          <button
            onClick={reset}
            className="font-mono text-[10px] text-[#f0eeff] border border-white/[0.06] px-3 py-1.5 hover:bg-white/[0.03] transition-colors"
          >
            {">>"} RETRY
          </button>
          <Link
            href="/"
            className="font-mono text-[10px] text-[#8b5cf6] border border-[#8b5cf6]/20 px-3 py-1.5 hover:bg-[#8b5cf6]/10 transition-colors"
          >
            {"[HOME]"}
          </Link>
        </div>
      </div>
    </div>
  );
}
