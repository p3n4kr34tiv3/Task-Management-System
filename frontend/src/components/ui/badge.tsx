import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for task status
        pending: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        "in-progress": "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        completed: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        // Priority variants
        high: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        medium: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        low: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        backlog: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
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