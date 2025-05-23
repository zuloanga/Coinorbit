import * as React from "react"

import { cn } from "@/lib/utils"

const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        {children}
      </div>
    )
  },
)
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-secondary/50",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:translate-x-[-1px] data-[side=right]:translate-x-[1px] data-[side=top]:translate-y-[-1px]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }

