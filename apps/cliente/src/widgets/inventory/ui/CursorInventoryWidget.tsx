import { MousePointer2, Palette } from "lucide-react";
import { useCursorStore, type CursorType } from "@/shared/store/useCursorStore";
import { useState } from "react";
import type { ReactNode } from "react";
import { audioManager } from "@/core/audio/AudioManager";

const CURSOR_OPTIONS: { id: CursorType; name: string; icon: ReactNode; desc: string }[] = [
  { 
    id: 'native', 
    name: 'Nativo', 
    icon: <MousePointer2 size={32} />, 
    desc: 'El cursor clásico de tu sistema operativo.' 
  },
  { 
    id: 'dot-ring', 
    name: 'Anillo Táctico', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="w-3 h-3 bg-[var(--color-ink)] rounded-full" />
        <div className="absolute w-12 h-12 border-[3px] border-[var(--color-ink)] border-dashed rounded-full opacity-80" />
      </div>
    ), 
    desc: 'Punto de precisión con anillo reactivo suavizado.' 
  },
  { 
    id: 'pencil', 
    name: 'Estela de Tinta', 
    icon: (
      <div className="relative w-16 h-12 flex items-center justify-end">
        <div className="w-3 h-3 bg-[var(--color-ink)] rounded-full mr-1" />
        <div className="w-2.5 h-2.5 bg-[var(--color-ink)] rounded-full opacity-70 mr-1 translate-y-[2px]" />
        <div className="w-2 h-2 bg-[var(--color-ink)] rounded-full opacity-40 mr-1 translate-y-[4px]" />
        <div className="w-1.5 h-1.5 bg-[var(--color-ink)] rounded-full opacity-20 translate-y-[5px]" />
      </div>
    ), 
    desc: 'Dibuja un rastro fluido de color al moverte.' 
  },
  { 
    id: 'crosshair', 
    name: 'Mira Cinética', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-[var(--color-high-pink)] rounded-full" />
        <div className="absolute w-0.5 h-3 bg-[var(--color-ink)] -translate-y-4" />
        <div className="absolute w-0.5 h-3 bg-[var(--color-ink)] translate-y-4" />
        <div className="absolute w-3 h-0.5 bg-[var(--color-ink)] -translate-x-4" />
        <div className="absolute w-3 h-0.5 bg-[var(--color-ink)] translate-x-4" />
      </div>
    ), 
    desc: 'Mira que se expande con tu velocidad de movimiento.' 
  },
  { 
    id: 'sparkle', 
    name: 'Motor Estelar', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute top-2 left-2 w-2 h-2 bg-[var(--color-high-yellow)] rounded-full opacity-50 shadow-[0_0_4px_var(--color-high-yellow)]" />
        <div className="absolute bottom-2 right-1 w-3 h-3 bg-[var(--color-high-yellow)] rounded-full opacity-80 shadow-[0_0_6px_var(--color-high-yellow)]" />
        <div className="absolute top-8 left-8 w-1 h-1 bg-[var(--color-high-yellow)] rounded-full opacity-40 shadow-[0_0_2px_var(--color-high-yellow)]" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-high-yellow)" className="drop-shadow-[0_0_8px_var(--color-high-yellow)]">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>
    ), 
    desc: 'Genera lluvia de partículas. Clic para estallar.' 
  },
  { 
    id: 'neon-glow', 
    name: 'Luz de Neón', 
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden">
        <div className="absolute w-12 h-12 rounded-full blur-[8px] mix-blend-multiply opacity-60 translate-x-[-8px] bg-[var(--color-high-pink)]" />
        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_8px_4px_var(--color-high-pink)] z-10" />
      </div>
    ), 
    desc: 'Aura pesada y luminosa que sigue lentamente a un núcleo brillante.' 
  },
  { 
    id: 'cyber-glitch', 
    name: 'Fallo Cibernético', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute w-4 h-4 border-2 border-red-500 bg-red-500/20 translate-x-[-6px] translate-y-[4px] mix-blend-multiply" />
        <div className="absolute w-4 h-4 border-2 border-cyan-400 bg-cyan-400/20 translate-x-[-12px] translate-y-[8px] mix-blend-multiply" />
        <div className="absolute w-4 h-4 bg-white border-2 border-black shadow-[0_0_0_2px_white] z-10" />
      </div>
    ), 
    desc: 'Deja clones con aberración cromática al moverte rápido.' 
  },
  { 
    id: 'bouncy-bubble', 
    name: 'Burbuja Gelatinosa', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="w-10 h-6 bg-[var(--color-cyan)] rounded-full border-2 border-black opacity-80 mix-blend-multiply origin-center -rotate-12" />
      </div>
    ), 
    desc: 'Burbuja que se estira y aplasta según la velocidad y ángulo.' 
  },
  { 
    id: 'random', 
    name: 'Sorpréndeme', 
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center text-5xl font-black text-[var(--color-ink)] animate-pulse drop-shadow-[0_4px_0_var(--color-high-pink)]">
        ?
      </div>
    ), 
    desc: 'Selecciona un motor físico diferente de forma aleatoria cada vez que entras a la aplicación.' 
  },
];

const COLORS = [
  { id: '#2b2b2b', name: 'Tinta (Clásico)' },
  { id: '#ff69b4', name: 'Rosa Neón' },
  { id: '#06b6d4', name: 'Cian' },
  { id: '#facc15', name: 'Amarillo Estelar' },
  { id: '#22c55e', name: 'Verde Matrix' },
  { id: '#ef4444', name: 'Rojo Carmesí' },
  { id: '#8b5cf6', name: 'Púrpura' },
  { id: '#f97316', name: 'Naranja Fuego' },
];

export function CursorInventoryWidget() {
  const { cursorType, setCursorType, cursorColor, setCursorColor } = useCursorStore();
  const [showEffect, setShowEffect] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Selector de Color Global */}
      {cursorType !== 'native' && (
        <div className="w-full flex flex-col items-start mb-10 bg-[var(--color-paper-dim)] p-6 rounded-2xl border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold mb-4 font-headline flex items-center gap-2">
            <Palette size={24}/> Color Primario:
          </h3>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setCursorColor(color.id);
                  audioManager.playUISound('cursor-select');
                }}
                className={`w-12 h-12 rounded-full border-4 transition-all ${
                  cursorColor === color.id
                    ? 'border-[var(--color-ink)] scale-110 shadow-[4px_4px_0px_0px_var(--color-ink)]'
                    : 'border-transparent hover:scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                }`}
                style={{ backgroundColor: color.id }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de Ratones fluido y escalable */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center pb-20">
        {CURSOR_OPTIONS.map((cursor) => {
          const isSelected = cursorType === cursor.id;
          return (
            <div
              key={cursor.id}
              className={`sketch-card p-5 pb-6 flex flex-col items-center cursor-pointer ${
                isSelected ? 'selected jitter' : ''
              }`}
              onClick={() => {
                if (cursor.id === 'random' && cursorType !== 'random') {
                  setShowEffect(true);
                  setTimeout(() => setShowEffect(false), 800);
                }
                setCursorType(cursor.id);
                if (cursor.id === 'random') {
                  audioManager.playUISound('random-select');
                } else {
                  audioManager.playUISound('cursor-select');
                }
              }}
            >
              <div className="w-full h-32 bg-white mb-4 flex items-center justify-center relative overflow-hidden border-2 border-[var(--color-ink)]">
                {cursor.icon}
              </div>
              <h2 className="font-headline text-2xl font-bold text-[var(--color-ink)] uppercase text-center mb-2">
                {cursor.name}
              </h2>
              <p className="text-gray-700 font-body text-xs text-center leading-relaxed">
                {cursor.desc}
              </p>
            </div>
          );
        })}
      </div>

      {showEffect && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/10 animate-in fade-in duration-200">
          <div className="animate-bounce -rotate-12">
            <div className="text-[250px] sm:text-[350px] font-black text-[var(--color-high-pink)] drop-shadow-[15px_15px_0_var(--color-ink)]">
              ?
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
