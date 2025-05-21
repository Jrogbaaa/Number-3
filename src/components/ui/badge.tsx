import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40",
  {
    variants: {
      variant: {
        default:
          "border-blue-500/20 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
        secondary:
          "border-gray-700/50 bg-gray-800/70 text-gray-300 hover:bg-gray-700/70",
        destructive:
          "border-red-500/20 bg-red-500/20 text-red-400 hover:bg-red-500/30",
        outline: 
          "border-gray-700 text-gray-300 bg-transparent",
        success:
          "border-green-500/20 bg-green-500/20 text-green-400 hover:bg-green-500/30",
        warning:
          "border-yellow-500/20 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
        info:
          "border-blue-500/20 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
        purple:
          "border-purple-500/20 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
        orange:
          "border-orange-500/20 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
        inactive:
          "border-gray-700/30 bg-gray-800/40 text-gray-500",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 