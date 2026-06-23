import { SoundButton } from './SoundButton';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'yellow' | 'pink';
  clickSound?: 'click' | 'confirm' | 'error' | 'none';
  hoverSound?: 'hover' | 'none';
}

export function SketchyButton({ children, variant = 'yellow', clickSound = 'click', hoverSound = 'hover', ...props }: Props) {
  const highlighters = {
    yellow: 'hover:bg-[var(--color-high-yellow)]',
    pink: 'hover:bg-[var(--color-high-pink)]',
  };

  return (
    <SoundButton
      {...props}
      clickSound={clickSound}
      hoverSound={hoverSound}
      style={{ filter: 'url(#sketchy-filter)', ...props.style }}
      className={`
        font-headline text-xl uppercase px-6 py-3
        border-3 border-[var(--color-ink)] bg-white text-[var(--color-ink)]
        shadow-[4px_4px_0px_0px_var(--color-ink-offset)]
        transition-all cursor-pointer select-none
        hover:animate-live-paper ${highlighters[variant]}
        active:translate-x-1 active:translate-y-1 active:shadow-none
        ${props.className || ''}
      `}
    >
      {children}
    </SoundButton>
  );
}