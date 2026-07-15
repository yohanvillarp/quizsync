import { useState, useEffect, useRef } from 'react';
import { Howler } from 'howler';
import { useAudioStore } from '@/core/audio/useAudioStore';
import { audioManager } from '@/core/audio/AudioManager';
import { useAvatarStore } from '@/shared/store/useAvatarStore';

export function useAudioAnalyzer() {
  const [beatValue, setBeatValue] = useState(0);
  const { isMuted, masterVolume, toggleMute, setVolume } = useAudioStore();
  const { selectedAvatar } = useAvatarStore();
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const setupAnalyzer = () => {
      // Howler.ctx se crea cuando Howler se inicializa
      const ctx = Howler.ctx;
      if (!ctx || analyserRef.current) return;
      
      try {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256; 
        // Conectamos el nodo principal de Howler al analizador para visualización
        Howler.masterGain.connect(analyserRef.current);
      } catch (e) {
        console.warn("No se pudo conectar el analizador de audio", e);
      }
    };

    const update = () => {
      if (!analyserRef.current) {
        setupAnalyzer();
        requestRef.current = requestAnimationFrame(update);
        return;
      }

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      const bassCount = 3; 
      for (let i = 0; i < bassCount; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bassCount;
      const normalized = Math.pow(avg / 255, 1.5); 
      
      setBeatValue(normalized);
      requestRef.current = requestAnimationFrame(update);
    };

    let resumeOnInteraction: () => void;
    const track = selectedAvatar === 'gallo' ? 'lobby_gallo' : 'lobby';

    if (!isMuted) {
      setupAnalyzer();
      // Intentamos reproducir, pero el navegador puede bloquearlo hasta que el usuario interactúe
      audioManager.playMusic(track);
      
      // Agregamos listeners para asegurar que suene al primer click o tecla
      resumeOnInteraction = () => {
        const ctx = Howler.ctx;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
        // Nos aseguramos de volver a llamarlo por si falló la primera vez
        audioManager.playMusic(track);
        
        document.removeEventListener('click', resumeOnInteraction);
        document.removeEventListener('keydown', resumeOnInteraction);
        document.removeEventListener('touchstart', resumeOnInteraction);
      };

      document.addEventListener('click', resumeOnInteraction);
      document.addEventListener('keydown', resumeOnInteraction);
      document.addEventListener('touchstart', resumeOnInteraction);

      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioManager.stopMusic();
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Limpiar listeners por si acaso
      if (resumeOnInteraction) {
        document.removeEventListener('click', resumeOnInteraction);
        document.removeEventListener('keydown', resumeOnInteraction);
        document.removeEventListener('touchstart', resumeOnInteraction);
      }
    };
  }, [isMuted, selectedAvatar]);

  const start = () => {
    if (isMuted) toggleMute();
    audioManager.playMusic(selectedAvatar === 'gallo' ? 'lobby_gallo' : 'lobby');
  };
  
  const stop = () => {
    if (!isMuted) toggleMute();
    audioManager.stopMusic();
  };

  return { 
    beatValue, 
    start, 
    stop, 
    isPlaying: !isMuted, 
    volume: masterVolume, 
    setVolume 
  };
}
