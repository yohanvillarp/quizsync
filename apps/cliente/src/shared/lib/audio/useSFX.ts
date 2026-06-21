import { useCallback, useEffect } from 'react';

// Singleton para pre-cargar el audio en memoria global
let preloadedAudio: HTMLAudioElement | null = null;

/**
 * Hook para reproducir efectos de sonido cortos (SFX)
 * en interacciones de la interfaz de usuario.
 */
export function useSFX() {
  useEffect(() => {
    // Precargamos el archivo en la memoria del navegador apenas se monta el componente
    // para evitar retrasos de red o decodificación al momento del clic.
    if (typeof window !== 'undefined' && !preloadedAudio) {
      preloadedAudio = new Audio('/audio/sfx/select.mp3');
      preloadedAudio.volume = 0.5;
      preloadedAudio.load(); // Fuerza al navegador a descargarlo ya mismo
    }
  }, []);

  const playSelectSound = useCallback(() => {
    try {
      if (!preloadedAudio) return;

      // Clonamos el nodo de audio en lugar de instanciar uno nuevo.
      // Esto permite clics superpuestos rápidos y usa la versión que ya está decodificada en memoria.
      const soundClone = preloadedAudio.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.5;
      
      const playPromise = soundClone.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("No se pudo reproducir el SFX:", error);
        });
      }
    } catch (e) {
      console.warn("API de Audio no soportada en este entorno.", e);
    }
  }, []);

  return { playSelectSound };
}
