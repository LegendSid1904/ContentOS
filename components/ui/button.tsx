import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "btn-primary",
  teal: "btn-teal",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  gradient: "btn-gradient",
} as const;

const sizes = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  sq: "btn-sq",
  "sq-sm": "btn-sq-sm",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("btn", variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
