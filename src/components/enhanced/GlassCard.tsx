'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "relative rounded-xl border backdrop-blur-sm transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
        subtle: "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10",
        prominent: "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30",
        colored: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:from-blue-500/15 hover:to-purple-500/15",
        success: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:from-green-500/15 hover:to-emerald-500/15",
        warning: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:from-yellow-500/15 hover:to-orange-500/15",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow-md",
        lg: "shadow-lg shadow-black/10",
        xl: "shadow-xl shadow-black/20",
        glow: "shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20",
      },
      animation: {
        none: "",
        hover: "hover:scale-[1.02] hover:-translate-y-1",
        subtle: "hover:scale-[1.01]",
        float: "hover:-translate-y-2",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "default",
      animation: "hover",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  glow?: boolean;
  gradient?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, shadow, animation, glow, gradient, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, shadow, animation }),
          glow && "ring-1 ring-blue-500/20 hover:ring-blue-500/40",
          className
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        )}
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-6", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-white flex items-center gap-2",
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400 leading-relaxed", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mt-6 pt-4 border-t border-white/10", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";

export { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardFooter, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent,
  glassCardVariants 
};