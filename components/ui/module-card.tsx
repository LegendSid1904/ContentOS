"use client";

import { cn } from "@/lib/utils";
import type { AppModuleDef } from "@/lib/constants";

type Module = AppModuleDef;

interface ModuleCardProps {
  module: Module;
  onClick?: () => void;
  className?: string;
}

function ModuleCard({ module, onClick, className }: ModuleCardProps) {
  return (
    <div
      className={cn("ascii-box rounded-r2 p-4 transition-colors duration-200 hover:bg-white/[0.03] cursor-pointer", className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      <span className="font-mono text-[9px] text-vi-400/60 tracking-[0.18em] uppercase mb-3 block">✦ AI Module</span>
      <div className="font-mono text-[22px] leading-none mb-2 text-tx-2">{module.icon}</div>
      <div className="font-mono text-[13px] font-semibold tracking-[0.05em] uppercase text-tx-1 mb-1.5">{module.name}</div>
      <div className="font-display text-[13px] text-tx-3 leading-relaxed">{module.desc}</div>
    </div>
  );
}

function ModuleGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("module-grid", className)}>{children}</div>;
}

function UsageCard({
  module,
  count,
  index,
}: {
  module: Module;
  count: number;
  index: number;
}) {
  const barPct = Math.min((count / Math.max(count, 5)) * 100, 100);

  return (
    <div className="ascii-box rounded-r2 p-3 transition-colors duration-200 hover:bg-white/[0.03] reveal d1">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[13px] text-tx-1 uppercase tracking-wider">
          {module.icon} {module.name}
        </span>
        <span className="font-mono text-[18px] font-bold text-te-400">
          {count}
        </span>
      </div>
      <div className="h-[3px] rounded-[2px] overflow-hidden bg-white/[0.04] mb-0.5">
        <div
          className="h-full rounded-[2px] transition-all duration-600"
          style={{
            width: `${Math.max(barPct, count > 0 ? 8 : 0)}%`,
            background: "linear-gradient(90deg, rgba(34,211,238,0.5), rgba(139,92,246,0.5))",
          }}
        />
      </div>
      <span className="font-mono text-[10px] text-tx-4 tracking-wider mt-1 block">
        {count === 0 ? "no activity" : `${count} project${count === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}

function UsageGrid({ children }: { children: React.ReactNode }) {
  return <div className="usage-grid">{children}</div>;
}

export { ModuleCard, ModuleGrid, UsageCard, UsageGrid, type ModuleCardProps };
