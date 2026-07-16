import { useEffect, useMemo, useRef } from 'react';
import { useAudioAnalyzer } from '@/shared/lib/audio/useAudioAnalyzer';
import { AudioControlsWidget } from './AudioControlsWidget';

// Generamos posiciones y configuraciones fijas para las esferitas
function generateSpheres() {
  const colors = ['var(--color-high-yellow)', 'var(--color-high-pink)', 'var(--color-paper-dim)'];
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 40 + 20, // 20px to 60px
    color: colors[i % colors.length],
    // Factor de variación individual para que no se deformen exactamente igual
    variance: Math.random() * 10 + 10,
    animationDelay: Math.random() * -5, // Para que floten desincronizados
  }));
}

export function AudioVisualizerWidget() {
  const { beatValueRef, start, stop, volume, setVolume, isPlaying } = useAudioAnalyzer();
  const spheres = useMemo(() => generateSpheres(), []);
  
  const sphereRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    
    const update = () => {
      if (beatValueRef.current !== undefined) {
        const beatValue = beatValueRef.current;
        const r1 = 50 + (beatValue * 25);
        const r2 = 50 - (beatValue * 20);
        const dynamicBorderRadius = `${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%`;
        
        sphereRefs.current.forEach((el, index) => {
          if (el) {
            const sphere = spheres[index];
            el.style.borderRadius = dynamicBorderRadius;
            el.style.transform = `scale(${1 + (beatValue * 0.4)}) rotate(${beatValue * sphere.variance}deg)`;
          }
        });
      }
      animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spheres, beatValueRef]);

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {spheres.map((sphere, i) => (
          <div
            key={sphere.id}
            ref={(el) => { sphereRefs.current[i] = el; }}
            className="absolute transition-all duration-75 ease-out shadow-sm"
            style={{
              left: `${sphere.left}%`,
              top: `${sphere.top}%`,
              width: `${sphere.size}px`,
              height: `${sphere.size}px`,
              backgroundColor: sphere.color,
              animation: `float 10s ease-in-out infinite alternate ${sphere.animationDelay}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Control Modular de Audio */}
      <AudioControlsWidget volume={volume} setVolume={setVolume} start={start} stop={stop} isPlaying={isPlaying} />
    </>
  );
}
