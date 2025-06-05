
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: // For 'Cancelled' status
          "border-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-sm hover:from-red-600 hover:to-red-800",
        outline: "text-foreground",
        success: // For 'Completed' status
          "border-transparent bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white shadow-sm hover:from-green-600 hover:to-green-800",
        warning: // For 'Pending' status
          "border-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-neutral-800 shadow-sm hover:from-yellow-500 hover:to-orange-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
