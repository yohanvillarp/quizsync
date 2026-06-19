import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

interface AudioControlsWidgetProps {
  volume: number;
  setVolume: (v: number) => void;
  start: () => void;
  isPlaying: boolean;
}

export function AudioControlsWidget({ volume, setVolume, start, isPlaying }: AudioControlsWidgetProps) {
  // Guardamos el volumen anterior antes de mutear para poder restaurarlo
  const previousVolume = useRef(0.5);
  // Estado para desplegar el slider (hover-based)
  const [isHovered, setIsHovered] = useState(false);

  const handleMuteToggle = () => {
    if (!isPlaying) start(); // Iniciar contexto de audio en la primera interacción
    
    if (volume > 0) {
      previousVolume.current = volume;
      setVolume(0);
    } else {
      setVolume(previousVolume.current || 0.5);
    }
  };

  let Icon = Volume2;
  if (volume === 0) Icon = VolumeX;
  else if (volume < 0.5) Icon = Volume1;

  return (
    <div
      className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[6px_6px_0px_0px_var(--color-ink-offset)] transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(true)} // Soporte táctil
    >
      {/* Botón de Ícono */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMuteToggle();
        }}
        className="text-[var(--color-ink)] hover:scale-110 transition-transform p-1"
        aria-label="Toggle mute"
      >
        <Icon size={32} strokeWidth={2.5} />
      </button>

      {/* Slider Desplegable */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
          isHovered ? 'w-32 px-3 opacity-100' : 'w-0 px-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            if (!isPlaying) start();
            setVolume(parseFloat(e.target.value));
          }}
          className="w-full h-3 bg-[var(--color-paper-dim)] rounded-lg appearance-none cursor-pointer accent-[var(--color-ink)]"
          title="Volume"
        />
      </div>
    </div>
  );
}
