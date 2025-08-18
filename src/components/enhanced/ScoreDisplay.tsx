'use client';

import * as React from "react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { HelpCircle, Trophy, Target, Layers2 } from "lucide-react";

const scoreDisplayVariants = cva(
  "relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border",
        compact: "px-2 py-1 text-xs",
        large: "px-4 py-2 text-base",
        minimal: "px-2 py-0.5 text-xs border-0",
      },
      scoreVariant: {
        excellent: "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10",
        good: "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border-green-500/30 shadow-sm shadow-green-500/10",
        average: "bg-gradient-to-r from-yellow-600/20 to-amber-600/20 text-yellow-400 border-yellow-500/30 shadow-sm shadow-yellow-500/10",
        poor: "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-400 border-orange-500/30 shadow-sm shadow-orange-500/10",
        critical: "bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 border-red-500/30 shadow-sm shadow-red-500/10",
        unknown: "bg-gray-700/20 text-gray-400 border-gray-600/30",
      },
      type: {
        overall: "ring-1 ring-yellow-500/20 bg-gradient-to-r from-yellow-600/30 to-amber-500/20",
        intent: "",
        engagement: "",
        budget: "",
        authority: "",
      }
    },
    defaultVariants: {
      variant: "default",
      scoreVariant: "unknown",
      type: "intent",
    },
  }
);

const getScoreVariant = (score?: number): "excellent" | "good" | "average" | "poor" | "critical" | "unknown" => {
  if (score === undefined || score === null) return "unknown";
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  if (score >= 20) return "poor";
  return "critical";
};

const getScoreIcon = (type: string) => {
  switch (type) {
    case "overall":
      return <Trophy className="w-4 h-4" />;
    case "intent":
      return <Target className="w-4 h-4" />;
    case "engagement":
      return <Layers2 className="w-4 h-4" />;
    default:
      return null;
  }
};

export interface ScoreDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof scoreDisplayVariants>, 'scoreVariant'> {
  score?: number;
  label: string;
  explanation?: string;
  icon?: React.ReactNode;
  showTooltip?: boolean;
  animated?: boolean;
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ 
    className, 
    variant, 
    type, 
    score, 
    label, 
    explanation, 
    icon, 
    showTooltip = true, 
    animated = true,
    ...props 
  }, ref) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const scoreVariant = getScoreVariant(score);
    const displayIcon = icon || getScoreIcon(type || "intent");

    const defaultExplanation = `This ${label} is calculated based on how well the lead matches your preferences.`;
    const tooltipText = explanation || defaultExplanation;

    return (
      <div className="relative inline-flex items-center" ref={ref} {...props}>
        <div
          className={cn(
            scoreDisplayVariants({ variant, scoreVariant, type }),
            animated && "hover:scale-105 hover:shadow-lg",
            className
          )}
          title={`${label}: ${score ?? 'N/A'}`}
        >
          {displayIcon && (
            <span className={cn(
              "flex-shrink-0",
              type === "overall" && "text-yellow-400"
            )}>
              {displayIcon}
            </span>
          )}
          
          <span className="font-medium">
            {score !== undefined ? score : 'N/A'}
          </span>
          
          {animated && score !== undefined && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>

        {showTooltip && (
          <>
            <button
              className="ml-1.5 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              onClick={(e) => {
                e.stopPropagation();
                setTooltipVisible(!tooltipVisible);
              }}
              aria-label={`${label} score explanation`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {tooltipVisible && (
              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 z-50 animate-in fade-in duration-200">
                <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
                  {displayIcon && (
                    <span className={cn(type === "overall" && "text-yellow-400")}>
                      {displayIcon}
                    </span>
                  )}
                  <span>How {label} is Calculated:</span>
                </div>
                <p className="leading-relaxed">{tooltipText}</p>
                <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-400 text-xs">Based on your preferences</span>
                </div>
                <div className="absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 bg-gray-900 border-r border-b border-gray-700"></div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ScoreDisplay.displayName = "ScoreDisplay";

export { ScoreDisplay, scoreDisplayVariants, getScoreVariant };