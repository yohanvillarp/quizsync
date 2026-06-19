import { useMemo } from 'react';
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
  const { audioRef, beatValue, start, volume, setVolume, isPlaying } = useAudioAnalyzer();
  const spheres = useMemo(() => generateSpheres(), []);

  // Matemáticas para deformar las esferas con el beat de la música
  // Transformamos el valor del beat (0 a 1) en porcentajes de border-radius (30% a 70%)
  const r1 = 50 + (beatValue * 25); // Hasta 75%
  const r2 = 50 - (beatValue * 20); // Hasta 30%
  const dynamicBorderRadius = `${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%`;

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <audio ref={audioRef} loop crossOrigin="anonymous">
          <source src="/audio/home-theme.webm" type="audio/webm" />
          <source src="/audio/home-theme.ogg" type="audio/ogg" />
          <source src="/audio/home-theme.mp3" type="audio/mpeg" />
        </audio>
        
        {spheres.map((sphere) => (
          <div
            key={sphere.id}
            className="absolute transition-all duration-75 ease-out shadow-sm"
            style={{
              left: `${sphere.left}%`,
              top: `${sphere.top}%`,
              width: `${sphere.size}px`,
              height: `${sphere.size}px`,
              backgroundColor: sphere.color,
              // Aplicamos la deformación dinámica
              borderRadius: dynamicBorderRadius,
              // Escala y ligera rotación que reacciona a la música
              transform: `scale(${1 + (beatValue * 0.4)}) rotate(${beatValue * sphere.variance}deg)`,
              // Movimiento flotante sutil CSS
              animation: `float 10s ease-in-out infinite alternate ${sphere.animationDelay}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Control Modular de Audio */}
      <AudioControlsWidget volume={volume} setVolume={setVolume} start={start} isPlaying={isPlaying} />
    </>
  );
}
