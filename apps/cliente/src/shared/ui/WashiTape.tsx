import React from 'react';

interface WashiTapeProps {
  colorClass?: string;
  rotation?: string;
  className?: string;
}

export const WashiTape: React.FC<WashiTapeProps> = ({ 
  colorClass = 'bg-accent-pink', 
  rotation = '-rotate-3',
  className = ''
}) => {
  return (
    <div 
      className={`washi-tape ${colorClass} ${rotation} ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
};
