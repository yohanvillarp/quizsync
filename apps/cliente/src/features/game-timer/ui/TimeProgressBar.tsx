import React from 'react';
import { Timer } from 'lucide-react';

interface TimeProgressBarProps {
  timeLeft: number;
  timeLimit: number;
}

export const TimeProgressBar: React.FC<TimeProgressBarProps> = ({ timeLeft, timeLimit }) => {
  // Calculamos el porcentaje para que inicie llena (100%) y se vaya vaciando (0%)
  const safeTimeLimit = timeLimit || 20;
  const percentage = Math.max(0, Math.min(100, (timeLeft / safeTimeLimit) * 100));
  
  const isDanger = timeLeft <= 5;

  return (
    <div className="w-full shrink-0 bg-ink/5 relative z-30 border-b-2 border-ink/10 py-3 sm:py-4 flex items-center px-6 sm:px-10">
      {/* Track de fondo */}
      <div className="w-full h-3 sm:h-4 bg-white border-2 border-ink shadow-inner relative flex-1 shrink-0 rounded-full">
        {/* Barra de llenado */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${isDanger ? 'bg-red-500' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Marca visual en la punta (derecha) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
            <div className={`bg-white border-2 border-ink rounded-full p-1.5 shadow-[2px_2px_0px_var(--color-ink)] ${isDanger ? 'animate-bounce text-red-500' : 'text-primary'}`}>
              <Timer size={18} strokeWidth={3} className={isDanger ? "animate-pulse" : ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
