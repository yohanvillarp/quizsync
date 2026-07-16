import { useEffect, useState } from 'react';
import { usePreloadStore } from '@/shared/store/usePreloadStore';
import { audioManager } from '@/core/audio/AudioManager';

export function Preloader({ children }: { children: React.ReactNode }) {
  const { isCriticalLoaded } = usePreloadStore();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // 1. Cargar fuentes
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });

    // 2. Cargar audio crítico
    audioManager.preloadCriticalAssetsAsync().then(() => {
      // 3. Iniciar carga pesada en segundo plano
      audioManager.preloadHeavyAssetsAsync();
    });
  }, []);

  if (isCriticalLoaded && fontsLoaded && !fadingOut) {
    return <>{children}</>;
  }

  const isReady = isCriticalLoaded && fontsLoaded;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[9999] bg-[var(--color-ink)] flex flex-col items-center justify-center transition-opacity duration-500 ${fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onTransitionEnd={() => {
          if (fadingOut) {
            // El componente ya no bloqueará interacción
          }
        }}
      >
        <div className="relative flex flex-col items-center">
          <h1 className="font-headline text-6xl text-white tracking-tighter mb-4 animate-pulse">
            QUIZ<span className="text-[var(--color-high-pink)]">SYNC</span>
          </h1>
          
          {!isReady ? (
            <>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden w-64">
                <div className="h-full bg-[var(--color-high-pink)] rounded-full animate-waving-progress w-full origin-left" style={{ animation: 'progress 1s ease-in-out infinite alternate' }} />
              </div>
              <p className="text-gray-400 font-body text-xs text-center mt-4 uppercase tracking-widest">
                Sincronizando...
              </p>
            </>
          ) : (
            <button 
              onClick={() => setFadingOut(true)}
              className="mt-4 px-8 py-3 bg-[var(--color-high-pink)] text-white font-headline text-2xl uppercase rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              Comenzar
            </button>
          )}
        </div>
      </div>
      {/* Montamos children para que React los prepare en background, pero ocultos tras el preloader */}
      <div className={fadingOut ? 'block' : 'hidden'}>
        {children}
      </div>
    </>
  );
}
