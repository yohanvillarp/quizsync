import React, { useState, useEffect } from 'react';
import { AlarmClock } from 'lucide-react';

interface GameTimerProps {
  initialTime?: number;
  onTimeUp?: () => void;
  onTick?: (timeLeft: number) => void;
}

export const GameTimer: React.FC<GameTimerProps> = ({ 
  initialTime = 30,
  onTimeUp,
  onTick
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const totalTime = initialTime;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    onTick?.(timeLeft);
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, onTick]);

  const offset = circumference - (timeLeft / totalTime) * circumference;
  const isDanger = timeLeft <= 10;
  const isTimeUp = timeLeft <= 0;

  return (
    <div className={`relative flex items-center justify-center ${isDanger && !isTimeUp ? 'animate-sketch' : ''} ${isTimeUp ? 'animate-bounce' : ''}`}>
      <div className="absolute -top-3 -right-2 text-ink z-10 drop-shadow-md">
         <AlarmClock size={28} className={isDanger ? "animate-pulse text-red-600" : ""} />
      </div>
      <div className="relative w-20 h-20 hand-drawn-box bg-white flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
          <circle 
            className="text-ink/10" 
            cx="50%" 
            cy="50%" 
            fill="none" 
            r="32" 
            stroke="currentColor" 
            strokeDasharray="4 4" 
            strokeWidth="3" 
          />
          <circle 
            className="timer-progress" 
            cx="50%" 
            cy="50%" 
            fill="none" 
            r="32" 
            stroke={isDanger ? '#ba1a1a' : 'var(--color-ink)'} 
            strokeDasharray={2 * Math.PI * 32} 
            strokeDashoffset={2 * Math.PI * 32 - (timeLeft / totalTime) * (2 * Math.PI * 32)} 
            strokeWidth="4" 
            style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 1s linear' }} 
          />
        </svg>
        <span 
          className="text-3xl font-headline font-black z-10"
          style={{ color: isDanger ? '#ba1a1a' : 'var(--color-ink)' }}
        >
          {isTimeUp ? "0" : timeLeft}
        </span>
      </div>
    </div>
  );
};
