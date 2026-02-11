/**
 * @module components/ui/button
 * Module implementation for button.tsx.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.98]",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]",
        ghost: "text-gray-700 hover:bg-gray-100",
        destructive: "bg-error text-white hover:bg-red-600 active:scale-[0.98]",
      },
      size: {
        sm: "px-3.5 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/**
 * Defines the ButtonProps contract.
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

/**
 * Executes Button.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function Button({
  className,
  variant,
  size,
  loading = false,
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  if (asChild) {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </Comp>
  );
}

export { buttonVariants };
