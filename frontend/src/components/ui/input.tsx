import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-300",
          "placeholder:text-muted-foreground/60",
          "hover:border-primary/30",
          "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:shadow-glow-warm-sm focus-visible:bg-card",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
