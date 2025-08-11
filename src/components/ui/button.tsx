import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger" | "success"
  size?: "sm" | "md" | "lg"
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-sans"

const variants = {
  primary: "bg-vmetrics-primary text-white hover:bg-vmetrics-accent focus:ring-vmetrics-primary",
  secondary: "bg-vmetrics-secondary text-white hover:bg-vmetrics-accent focus:ring-vmetrics-secondary",
  accent: "bg-vmetrics-accent text-white hover:bg-vmetrics-primary focus:ring-vmetrics-primary",
  outline: "border border-vmetrics-primary text-vmetrics-primary bg-white hover:bg-vmetrics-background focus:ring-vmetrics-primary",
  danger: "bg-vmetrics-danger text-white hover:bg-red-600 focus:ring-vmetrics-primary",
  success: "bg-vmetrics-success text-white hover:bg-green-600 focus:ring-vmetrics-primary",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button" 