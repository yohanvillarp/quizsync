import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface AudioControlsWidgetProps {
  volume: number;
  setVolume: (v: number) => void;
  start: () => void;
  stop: () => void;
  isPlaying: boolean;
}

export function AudioControlsWidget({ volume, setVolume, start, stop, isPlaying }: AudioControlsWidgetProps) {
  const previousVolume = useRef(0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleMuteToggle = () => {
    if (volume > 0) {
      previousVolume.current = volume;
      setVolume(0);
      stop();
    } else {
      setVolume(previousVolume.current || 0.5);
      start();
    }
  };

  let Icon = Volume2;
  if (volume === 0) Icon = VolumeX;
  else if (volume < 0.5) Icon = Volume1;

  return (
    <div
      ref={containerRef}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] transition-all cursor-pointer"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMuteToggle();
        }}
        className="text-[var(--color-ink)] hover:scale-110 transition-transform p-1"
        aria-label="Toggle mute"
      >
        <Icon size={28} strokeWidth={2.5} className="sm:!w-8 sm:!h-8" />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
          isExpanded ? 'w-24 sm:w-32 px-2 sm:px-3 opacity-100' : 'w-0 px-0 opacity-0'
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
            if (val === 0) {
              stop();
            } else if (!isPlaying) {
              start();
            }
          }}
          className="w-full h-4 sm:h-3 bg-[var(--color-paper-dim)] rounded-lg appearance-none cursor-pointer accent-[var(--color-ink)]"
          title="Volume"
        />
      </div>
    </div>
  );
}
