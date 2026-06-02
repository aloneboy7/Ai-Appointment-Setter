"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-ring cursor-pointer";

    const variants = {
      primary:
        "bg-primary hover:bg-primary-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5",
      secondary:
        "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:-translate-y-0.5",
      ghost:
        "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white",
      outline:
        "border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;