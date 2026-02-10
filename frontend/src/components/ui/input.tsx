/**
 * @module components/ui/input
 * Module implementation for input.tsx.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Defines the InputProps contract.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      required,
      id,
      onChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();
    const resolvedId = id ?? inputId;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      onValueChange?.(event.target.value);
      onChange?.(event);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={resolvedId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}
        <input
          id={resolvedId}
          type={type}
          ref={ref}
          required={required}
          onChange={handleChange}
          className={cn(
            "w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
