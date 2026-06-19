"use client";

type Step = string | { label: string; status?: "pending" | "active" | "done" | "error" };

export function StreamingLoader({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  const resolved = steps.map((s) =>
    typeof s === "string" ? { label: s, status: "active" as const } : { label: s.label, status: s.status ?? "active" }
  );

  return (
    <div className={className || "boot-loader"}>
      {resolved.map((s, i) => {
        const isLast = i === resolved.length - 1;
        const isActive = s.status === "active" || s.status === "pending";

        return (
          <div key={i} className="boot-loader-line" style={{ animationDelay: `${0.1 + i * 0.2}s` }}>
            <span className="boot-loader-arrow">
              {s.status === "done" ? "[OK]" : s.status === "error" ? "[!!]" : ">>"}
            </span>
            <span className="boot-loader-text">{s.label}</span>
            <span className="boot-loader-ok">
              {s.status === "done" && (
                <span className="text-ok tracking-wider text-[9px]">DONE</span>
              )}
              {s.status === "error" && (
                <span className="text-err tracking-wider text-[9px]">FAIL</span>
              )}
              {isActive && isLast && (
                <span className="text-te-400/80 tracking-wider">LOADING</span>
              )}
              {isActive && !isLast && (
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0s" }} />
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
