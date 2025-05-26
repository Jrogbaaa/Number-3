import React from 'react';

interface LogoProps {
  className?: string;
}

export const OptiLeadsLogo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <span>OptiLeads</span>
  );
}; 