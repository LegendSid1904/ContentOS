import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="field">
        {label && (
          <label htmlFor={id} className="field-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn("select", className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && <span className="field-hint">{hint}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select, type SelectProps, type SelectOption };
