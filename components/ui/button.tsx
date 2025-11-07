import * as React from "react";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let base = "px-4 py-2 rounded font-medium focus:outline-none transition-colors";
    let variantClass = "";
    if (variant === "default") variantClass = "bg-purple-600 text-white hover:bg-purple-700";
    if (variant === "outline") variantClass = "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50";
    if (variant === "ghost") variantClass = "bg-transparent text-purple-700 hover:bg-purple-50";
    return (
      <button ref={ref} className={`${base} ${variantClass} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
