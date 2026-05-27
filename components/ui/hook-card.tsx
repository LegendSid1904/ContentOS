"use client";

import { cn } from "@/lib/utils";

interface Hook {
  id: string;
  hook_text: string;
  framework: string;
}

interface HookCardProps {
  hook: Hook;
  index: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

function HookCard({ hook, index, selected, onSelect }: HookCardProps) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-r8 border p-4 transition-all duration-300",
        selected
          ? "border-vi-500 bg-vi-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          : "border-bd-2 bg-bg-float hover:border-vi-500/50 hover:bg-bg-hover",
      )}
      onClick={() => onSelect?.(hook.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onSelect) onSelect(hook.id);
      }}
    >
      <div className="mb-2 flex items-center gap-3">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
            selected
              ? "bg-vi-500 text-white"
              : "bg-bg-raised text-tx-3 group-hover:bg-vi-500/20 group-hover:text-vi-400",
          )}
        >
          {index + 1}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-tx-4">
          {hook.framework}
        </span>
        {selected && (
          <span className="ml-auto text-vi-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-tx-1">{hook.hook_text}</p>
    </div>
  );
}

function HookGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>;
}

export { HookCard, HookGrid };
export type { Hook };
