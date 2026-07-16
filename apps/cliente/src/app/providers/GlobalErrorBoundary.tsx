import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AppLayout } from '../router/AppLayout';
import { NotFoundPage } from '@/pages/not-found/ui/NotFoundPage';
import { SoundButton } from '@/shared/ui/SoundButton';
import { RotateCcw } from 'lucide-react';

export const GlobalErrorBoundary: React.FC = () => {
  const error = useRouteError();

  // Si el error es un 404 de React Router, mostramos nuestra página tematizada
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <AppLayout>
        <NotFoundPage />
      </AppLayout>
    );
  }

  // Si es un error catastrófico de código (runtime)
  return (
    <AppLayout>
      <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
        <div className="relative flex flex-col items-center w-full max-w-lg z-10">
          
          <div className="bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_var(--color-ink)] rotate-1 text-center w-full mb-8">
            <h2 className="font-headline font-black text-3xl sm:text-4xl text-white drop-shadow-[2px_2px_0px_var(--color-ink)] uppercase tracking-tight mb-4">
              ¡La app tropezó!
            </h2>
            <p className="font-body text-base sm:text-lg text-white font-medium leading-tight mb-4 bg-[var(--color-ink)] p-3 rounded-xl border-2 border-white/20 shadow-inner overflow-hidden text-ellipsis whitespace-nowrap">
              {error instanceof Error ? error.message : "Error interno desconocido"}
            </p>
          </div>

          <SoundButton 
            onClick={() => window.location.href = '/'}
            className="bg-[var(--color-high-yellow)] border-4 border-[var(--color-ink)] text-[var(--color-ink)] font-headline font-black text-xl px-8 py-4 rounded-2xl shadow-[6px_6px_0px_var(--color-ink)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--color-ink)] transition-all flex items-center justify-center gap-3 uppercase -rotate-1"
          >
            <RotateCcw size={24} strokeWidth={3} />
            Reiniciar Juego
          </SoundButton>

        </div>
      </div>
    </AppLayout>
  );
};
