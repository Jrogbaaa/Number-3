'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const enhancedButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/25",
        secondary: "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hover:border-gray-600 shadow-md hover:shadow-lg",
        outline: "border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-blue-500/50",
        ghost: "text-gray-300 hover:bg-gray-800/50 hover:text-white",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-xl hover:shadow-red-500/25",
        success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg hover:shadow-xl hover:shadow-green-500/25",
        glass: "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-14 rounded-xl px-10 text-lg",
      },
      animation: {
        none: "",
        hover: "hover:scale-105 active:scale-95",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "hover",
    },
  }
);

const shimmerVariants = cva(
  "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out",
  {
    variants: {
      variant: {
        default: "via-white/20",
        secondary: "via-white/10",
        outline: "via-blue-400/20",
        ghost: "via-white/10",
        destructive: "via-white/20",
        success: "via-white/20",
        glass: "via-white/30",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  shimmer?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant, size, animation, loading, shimmer = true, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(enhancedButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {shimmer && !loading && (
          <div className={cn(shimmerVariants({ variant }))} />
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <span className={cn("relative z-10 flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
      </button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };