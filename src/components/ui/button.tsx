import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger" | "success"
  size?: "sm" | "md" | "lg"
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-sans"

const variants = {
  primary: "bg-[#3cd48f] text-white hover:bg-[#3cd48f]/90 focus:ring-[#3cd48f]/40",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-400",
  accent: "bg-[#3cd48f]/80 text-white hover:bg-[#3cd48f] focus:ring-[#3cd48f]/40",
  outline: "border border-[#3cd48f] text-[#3cd48f] bg-white hover:bg-[#3cd48f]/10 focus:ring-[#3cd48f]/40",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
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