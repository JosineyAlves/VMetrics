import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger" | "success"
  size?: "sm" | "md" | "lg"
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-sans"

const variants = {
  primary: "bg-trackview-primary text-white hover:bg-trackview-accent focus:ring-trackview-primary",
  secondary: "bg-trackview-secondary text-white hover:bg-trackview-accent focus:ring-trackview-secondary",
  accent: "bg-trackview-accent text-white hover:bg-trackview-primary focus:ring-trackview-accent",
  outline: "border border-trackview-primary text-trackview-primary bg-white hover:bg-trackview-background focus:ring-trackview-primary",
  danger: "bg-trackview-danger text-white hover:bg-red-600 focus:ring-trackview-danger",
  success: "bg-trackview-success text-white hover:bg-green-600 focus:ring-trackview-success",
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