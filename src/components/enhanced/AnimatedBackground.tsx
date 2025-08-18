'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

interface OrbProps {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

interface NeuralLineProps {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  duration: number;
}

export interface AnimatedBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'normal' | 'intense';
  variant?: 'particles' | 'orbs' | 'neural' | 'mixed';
  animated?: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className,
  intensity = 'normal',
  variant = 'mixed',
  animated = true
}) => {
  // Generate deterministic positions for particles
  const particleCount = intensity === 'subtle' ? 20 : intensity === 'normal' ? 30 : 50;
  const particles: ParticleProps[] = React.useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (i * 17 + 23) % 100,
      y: (i * 31 + 47) % 100,
      delay: (i * 2) % 20,
      duration: 25 + (i % 15),
      size: 1 + (i % 2) * 0.5
    })), [particleCount]
  );

  // Generate deterministic positions for orbs
  const orbCount = intensity === 'subtle' ? 3 : intensity === 'normal' ? 5 : 8;
  const orbs: OrbProps[] = React.useMemo(() =>
    Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      x: (i * 23 + 31) % 90 + 5,
      y: (i * 37 + 19) % 90 + 5,
      delay: (i * 3) % 15,
      duration: 35 + (i % 10),
      size: 60 + (i % 30)
    })), [orbCount]
  );

  // Generate deterministic positions for neural network lines
  const lineCount = intensity === 'subtle' ? 4 : intensity === 'normal' ? 6 : 10;
  const neuralLines: NeuralLineProps[] = React.useMemo(() =>
    Array.from({ length: lineCount }, (_, i) => ({
      id: i,
      x1: (i * 19 + 13) % 100,
      y1: (i * 29 + 41) % 100,
      x2: (i * 43 + 7) % 100,
      y2: (i * 53 + 17) % 100,
      delay: (i * 2) % 12,
      duration: 20 + (i % 10)
    })), [lineCount]
  );

  const shouldShowParticles = variant === 'particles' || variant === 'mixed';
  const shouldShowOrbs = variant === 'orbs' || variant === 'mixed';
  const shouldShowNeural = variant === 'neural' || variant === 'mixed';

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Animated Particles */}
      {shouldShowParticles && particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className={cn(
            "absolute bg-blue-400/8 rounded-full",
            animated && "animate-drift"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: animated ? `${particle.delay}s` : '0s',
            animationDuration: animated ? `${particle.duration + 20}s` : '0s',
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
        />
      ))}

      {/* Floating Orbs */}
      {shouldShowOrbs && orbs.map((orb) => (
        <div
          key={`orb-${orb.id}`}
          className={cn(
            "absolute rounded-full bg-gradient-to-r from-blue-500/4 to-indigo-500/4",
            animated && "animate-float"
          )}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDelay: animated ? `${orb.delay}s` : '0s',
            animationDuration: animated ? `${orb.duration + 25}s` : '0s'
          }}
        />
      ))}

      {/* Neural Network Lines */}
      {shouldShowNeural && (
        <svg className="absolute inset-0 w-full h-full">
          {neuralLines.map((line) => (
            <line
              key={`line-${line.id}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="rgba(59, 130, 246, 0.04)"
              strokeWidth="0.5"
              className={cn(animated && "animate-neural-pulse")}
              style={{
                animationDelay: animated ? `${line.delay}s` : '0s',
                animationDuration: animated ? `${line.duration + 15}s` : '0s'
              }}
            />
          ))}
        </svg>
      )}

      {/* Geometric Elements */}
      <div 
        className={cn(
          "absolute top-1/4 left-1/4 w-8 h-8 border border-blue-400/5 rotate-45",
          animated && "animate-drift"
        )} 
        style={{ animationDuration: animated ? '45s' : '0s' }} 
      />
      <div 
        className={cn(
          "absolute top-3/4 right-1/4 w-6 h-6 border border-indigo-400/5 rotate-12",
          animated && "animate-float"
        )} 
        style={{ animationDuration: animated ? '50s' : '0s' }} 
      />
      <div 
        className={cn(
          "absolute top-1/2 left-3/4 w-4 h-4 border border-blue-300/5 -rotate-12",
          animated && "animate-drift"
        )} 
        style={{ animationDuration: animated ? '55s' : '0s' }} 
      />
      
      {/* Scanning lines */}
      <div 
        className={cn(
          "absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/8 to-transparent",
          animated && "animate-drift"
        )} 
        style={{ animationDuration: animated ? '60s' : '0s' }} 
      />
      <div 
        className={cn(
          "absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/6 to-transparent",
          animated && "animate-drift"
        )} 
        style={{ 
          animationDuration: animated ? '65s' : '0s', 
          animationDelay: animated ? '20s' : '0s' 
        }} 
      />
      
      {/* Circular elements */}
      <div 
        className={cn(
          "absolute top-1/5 right-1/5 w-20 h-20 border border-blue-400/4 rounded-full",
          animated && "animate-pulse-glow"
        )} 
        style={{ animationDuration: animated ? '15s' : '0s' }} 
      />
      <div 
        className={cn(
          "absolute bottom-1/4 left-1/6 w-16 h-16 border border-indigo-400/4 rounded-full",
          animated && "animate-pulse-glow"
        )} 
        style={{ 
          animationDuration: animated ? '18s' : '0s', 
          animationDelay: animated ? '8s' : '0s' 
        }} 
      />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/8 via-transparent to-indigo-900/8" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/4 to-transparent" />
    </div>
  );
};

export { AnimatedBackground };