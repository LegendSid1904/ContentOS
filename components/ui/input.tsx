import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, icon, id, ...props }, ref) => {
    return (
      <div className="field">
        {label && (
          <label htmlFor={id} className="field-label">
            {label}
          </label>
        )}
        {icon ? (
          <div className="input-icon-wrap">
            <span className="input-icon">{icon}</span>
            <input
              ref={ref}
              id={id}
              className={cn("input", className)}
              {...props}
            />
          </div>
        ) : (
          <input
            ref={ref}
            id={id}
            className={cn("input", className)}
            {...props}
          />
        )}
        {hint && <span className="field-hint">{hint}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, type InputProps };
