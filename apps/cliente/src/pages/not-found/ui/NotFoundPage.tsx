import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SoundButton } from '@/shared/ui/SoundButton';
import { getAvatarComponent } from '@/entities/player/registry/avatarRegistry';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      
      <div className="relative flex flex-col items-center w-full max-w-lg z-10 mt-8">
        
        {/* Avatar Confundido */}
        <div className="w-32 h-32 sm:w-48 sm:h-48 mb-6 sm:mb-8 drop-shadow-[4px_4px_0px_var(--color-ink)] opacity-90 animate-wiggle">
          {getAvatarComponent('fox')}
        </div>
        
        {/* Título de Error */}
        <h1 className="text-[var(--color-ink)] font-headline font-black text-6xl sm:text-8xl drop-shadow-[4px_4px_0px_var(--color-high-yellow)] uppercase tracking-tighter text-center leading-none mb-4 -rotate-2">
          404
        </h1>
        
        {/* Mensaje */}
        <div className="bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_var(--color-ink)] rotate-1 text-center w-full mb-8">
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[var(--color-ink)] uppercase tracking-tight mb-2">
            ¡Te has perdido!
          </h2>
          <p className="font-body text-base sm:text-lg text-[var(--color-ink-offset)] font-medium leading-tight">
            La sala a la que intentas entrar no existe, fue eliminada o el enlace ha caducado.
          </p>
        </div>

        {/* Botón Volver */}
        <SoundButton 
          onClick={() => navigate('/')}
          className="bg-[var(--color-accent-pink)] border-4 border-[var(--color-ink)] text-[var(--color-ink)] font-headline font-black text-xl sm:text-2xl px-8 py-4 sm:px-12 sm:py-5 rounded-2xl shadow-[6px_6px_0px_var(--color-ink)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-ink)] transition-all flex items-center justify-center gap-3 uppercase -rotate-2"
        >
          <Home size={28} strokeWidth={3} />
          Volver al Inicio
        </SoundButton>

      </div>
      
    </div>
  );
};
