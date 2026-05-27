import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/constants";

type BadgeVariant = "vi" | "te" | "fu" | "ok" | "err" | "ghost";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "vi", ...props }: BadgeProps) {
  return (
    <span
      className={cn("badge", `badge-${variant}`, className)}
      {...props}
    />
  );
}

const planStyles: Record<Plan, string> = {
  Free: "plan-free",
  Creator: "plan-creator",
  Agency: "plan-agency",
};

interface PlanBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  plan: Plan;
}

function PlanBadge({ className, plan, ...props }: PlanBadgeProps) {
  return (
    <span
      className={cn("plan-badge", planStyles[plan], className)}
      {...props}
    >
      {plan}
    </span>
  );
}

export { Badge, PlanBadge, type BadgeProps, type BadgeVariant, type PlanBadgeProps };
