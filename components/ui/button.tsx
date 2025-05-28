import React from "react"

import { cn } from "@/lib/utils"

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "ghost" }
>(({ className, children, variant, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary/50",
        variant === "ghost"
          ? "bg-transparent hover:bg-secondary/50"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
