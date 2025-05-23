import * as React from "react"

import { cn } from "@/lib/utils"

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
            <div
              className={cn("fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]", className)}
              ref={ref}
              {...props}
            >
              {children}
            </div>
          </div>
        )}
      </>
    )
  },
)
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
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
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("bg-background text-foreground rounded-lg p-6 shadow-lg w-full max-w-lg mx-4", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} ref={ref} {...props}>
        {children}
      </div>
    )
  },
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} ref={ref} {...props}>
        {children}
      </h3>
    )
  },
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p className={cn("text-sm text-muted-foreground", className)} ref={ref} {...props}>
        {children}
      </p>
    )
  },
)
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }

