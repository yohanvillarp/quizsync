import { audioManager } from '@/core/audio/AudioManager';
import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface SoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Sonido a reproducir al hacer click. Por defecto es 'click' */
  clickSound?: 'click' | 'confirm' | 'error' | 'none' | 'random-select';
  /** Sonido a reproducir al pasar el mouse por encima. Por defecto está apagado ('none') para no saturar al usuario */
  hoverSound?: 'hover' | 'none';
}

/**
 * Un componente modular que envuelve a un <button> normal,
 * pero le añade automáticamente sonidos de interfaz interactivos y consistentes.
 */
export const SoundButton: React.FC<SoundButtonProps> = ({ 
  clickSound = 'click', 
  hoverSound = 'none', 
  onClick, 
  onMouseEnter, 
  children, 
  ...props 
}) => {
  return (
    <button
      {...props}
      onMouseEnter={(e) => {
        if (hoverSound !== 'none') audioManager.playUISound(hoverSound);
        if (onMouseEnter) onMouseEnter(e);
      }}
      onClick={(e) => {
        if (clickSound !== 'none') audioManager.playUISound(clickSound);
        if (onClick) onClick(e);
      }}
    >
      {children}
    </button>
  );
};
