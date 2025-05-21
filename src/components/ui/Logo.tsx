import React from 'react';

interface LogoProps {
  className?: string;
}

export const PropsLogo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`font-bold text-2xl tracking-tight ${className}`}>
      <span>PROPS</span>
      <div className="w-12 h-1 bg-accent-blue mt-1"></div>
    </div>
  );
}; 