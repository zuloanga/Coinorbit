import * as React from "react"

import { cn } from "@/lib/utils"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("rounded-md border bg-card text-card-foreground shadow-sm", className)} ref={ref} {...props}>
        {children}
      </div>
    )
  },
)
Card.displayName = "Card"
