import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import { SoundButton } from '@/shared/ui/SoundButton';

interface AnswerOptionProps {
  letter: string;
  text: string;
  rotation?: string;
  onClick?: () => void;
  styleType?: 'default' | 'alt';
  isSelected?: boolean;
  isSuggested?: boolean;
  disabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({ 
  letter, 
  text, 
  rotation = 'rotate-0', 
  onClick,
  styleType = 'default',
  isSelected = false,
  isSuggested = false,
  disabled = false
}) => {
  const [hovered, setHovered] = useState(false);
  const baseBoxClass = styleType === 'default' ? 'hand-drawn-box' : 'hand-drawn-box-alt';

  return (
    <SoundButton 
      clickSound="confirm"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      className={`${baseBoxClass} group p-6 md:p-8 flex items-center gap-4 md:gap-6 ${disabled ? '' : 'highlighter-hover hover:scale-[1.03] active:scale-95'} text-left relative overflow-hidden transition-all ${isSelected ? 'bg-[var(--color-high-yellow)] ring-4 ring-black scale-[1.03] -translate-y-1' : isSuggested ? 'bg-[var(--color-high-pink)]/20 ring-4 ring-[var(--color-high-pink)] animate-pulse' : 'bg-white'} ${disabled && !isSelected ? 'opacity-50' : ''}`}
      style={{
        transform: (hovered && !disabled) || isSelected || isSuggested ? 'scale(1.03) translateY(-4px)' : `scale(1) ${rotation ? `rotate(${rotation.replace('rotate-', '')}deg)` : ''}`,
      }}
    >
      {isSuggested && !isSelected && (
        <div className="absolute top-2 left-2 text-[10px] font-headline font-black tracking-widest uppercase bg-[var(--color-high-pink)] text-white px-2 py-0.5 rounded-full rotate-[-5deg]">
          Pista de Poder
        </div>
      )}
      <span className="text-3xl font-headline font-black text-ink/20 group-hover:text-ink/40 transition-colors">
        {letter}.
      </span>
      <span className="text-xl md:text-2xl font-headline font-bold text-ink">
        {text}
      </span>
      
      <div className="absolute bottom-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <PenTool size={20} className="text-ink/30" />
      </div>
    </SoundButton>
  );
};
