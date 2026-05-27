import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    return (
      <div className="field">
        {label && (
          <label htmlFor={id} className="field-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn("textarea", className)}
          {...props}
        />
        {hint && <span className="field-hint">{hint}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
