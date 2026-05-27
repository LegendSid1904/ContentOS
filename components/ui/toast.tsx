import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ToastVariant = "ok" | "err" | "vi";

interface ToastProps {
  variant?: ToastVariant;
  icon?: string;
  children: ReactNode;
  className?: string;
}

function Toast({ variant = "vi", icon, children, className }: ToastProps) {
  return (
    <div className={cn("toast", variant === "ok" && "toast-ok", variant === "err" && "toast-err")}>
      {icon && <span className="toast-icon">{icon}</span>}
      {children}
    </div>
  );
}

export { Toast, type ToastProps, type ToastVariant };
