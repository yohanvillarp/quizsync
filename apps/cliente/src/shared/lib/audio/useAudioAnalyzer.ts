import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyzer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [beatValue, setBeatValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Cargamos el volumen de localStorage, o iniciamos muteados si no hay registro
  const savedVolume = localStorage.getItem('quizsync_volume');
  const [volume, setVolume] = useState(savedVolume ? parseFloat(savedVolume) : 0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Crear el AudioContext solo una vez (requiere interacción previa)
    if (!audioCtxRef.current && isPlaying) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return; // Fallback si no soporta Web Audio API
      
      audioCtxRef.current = new AudioContextClass();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Definimos un tamaño de buffer pequeño para bajos rápidos
      
      // Conectar el elemento de audio al analizador
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }

    const update = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Extraemos la energía de las frecuencias muy bajas (Bass - primeros 3 bins)
      let sum = 0;
      const bassCount = 3; // Menos bins para aislar solo los golpes graves
      for (let i = 0; i < bassCount; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bassCount;
      // Exageramos los picos usando una curva de potencia para que los golpes se noten mucho más
      const normalized = Math.pow(avg / 255, 1.5); 
      
      setBeatValue(normalized);
      requestRef.current = requestAnimationFrame(update);
    };

    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().catch(e => console.warn("Autoplay bloqueado por el navegador:", e));
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      audioRef.current?.pause();
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Actualizar el volumen físico y guardar en localStorage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('quizsync_volume', volume.toString());
  }, [volume]);

  const start = () => setIsPlaying(true);
  const stop = () => setIsPlaying(false);

  return { audioRef, beatValue, start, stop, isPlaying, volume, setVolume };
}
