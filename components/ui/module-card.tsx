import { cn } from "@/lib/utils";
import type { MODULES } from "@/lib/constants";

type Module = (typeof MODULES)[number];

interface ModuleCardProps {
  module: Module;
  onClick?: () => void;
  className?: string;
}

function ModuleCard({ module, onClick, className }: ModuleCardProps) {
  return (
    <div
      className={cn("module-card", className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      <span className="mod-ai">✦ AI Module</span>
      <div className="mod-icon">{module.icon}</div>
      <div className="mod-name">{module.name}</div>
      <div className="mod-desc">{module.desc}</div>
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

export { ModuleCard, ModuleGrid, type ModuleCardProps };
