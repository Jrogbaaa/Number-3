import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
        destructive:
          "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md",
        outline:
          "border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-blue-400 bg-gray-900/50 hover:bg-gray-800/70",
        secondary:
          "bg-gray-800 hover:bg-gray-700 text-white shadow-sm hover:shadow-md border border-gray-700/50",
        ghost: 
          "text-gray-400 hover:bg-gray-800 hover:text-white",
        link: 
          "text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline p-0 h-auto",
        icon:
          "h-9 w-9 p-0 rounded-md bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 py-1.5 text-xs",
        lg: "h-11 rounded-md px-8 py-2.5 text-base",
        xl: "h-12 rounded-md px-10 py-3 text-base",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 