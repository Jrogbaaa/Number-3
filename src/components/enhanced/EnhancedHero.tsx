'use client';

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedButton } from "./EnhancedButton";
import { AnimatedBackground } from "./AnimatedBackground";

export interface EnhancedHeroProps {
  className?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  animated?: boolean;
}

const EnhancedHero: React.FC<EnhancedHeroProps> = ({
  className,
  title = "Find Your Best Leads",
  subtitle = "with AI Precision",
  description = "OptiLeads.ai uses advanced AI to identify, score, and engage high-quality leads that are most likely to convert, saving you time and maximizing your ROI.",
  primaryCTA = {
    text: "Get Started for Free",
    href: "/onboarding"
  },
  secondaryCTA = {
    text: "Learn more",
    href: "#features"
  },
  animated = true
}) => {
  return (
    <section className={cn("relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden", className)}>
      {/* Enhanced Animated Background */}
      <AnimatedBackground 
        intensity="normal" 
        variant="mixed" 
        animated={animated}
      />
      
      {/* Enhanced Background Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]"></div>
      
      {/* Enhanced dots pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Enhanced Glow effect behind hero content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "w-96 h-96 bg-blue-500/15 rounded-full blur-3xl",
          animated && "animate-pulse-glow"
        )} style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Hero Content */}
      <div className="mx-auto max-w-5xl text-center relative z-10">
        {/* Enhanced Title with Staggered Animation */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className={cn(
              "block drop-shadow-2xl text-white",
              animated && "animate-fade-in"
            )}>
              {title}
            </span>
            <span className={cn(
              "block mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg",
              animated && "animate-slide-up"
            )} style={{ animationDelay: '0.2s' }}>
              {subtitle}
            </span>
          </h1>
        </div>
        
        {/* Enhanced Description */}
        <p className={cn(
          "text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed",
          animated && "animate-fade-in"
        )} style={{ animationDelay: '0.4s' }}>
          {description}
        </p>
        
        {/* Enhanced CTA Buttons */}
        <div className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-6",
          animated && "animate-scale-in"
        )} style={{ animationDelay: '0.6s' }}>
          <EnhancedButton
            variant="default"
            size="xl"
            className="group"
            asChild
          >
            <Link href={primaryCTA.href}>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              {primaryCTA.text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </EnhancedButton>
          
          <EnhancedButton
            variant="glass"
            size="xl"
            className="group"
            asChild
          >
            <Link href={secondaryCTA.href}>
              {secondaryCTA.text}
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </EnhancedButton>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-0 w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '3s', animationDuration: '12s' }}></div>
      </div>
    </section>
  );
};

export { EnhancedHero };