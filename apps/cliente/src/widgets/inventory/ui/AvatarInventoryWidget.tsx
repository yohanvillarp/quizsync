import { useAvatarStore } from "@/shared/store/useAvatarStore";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar, GalloAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { useState, useEffect } from "react";
import { audioManager } from "@/core/audio/AudioManager";
import { COMPANIONS_MOCK } from "@/entities/player/model/companions.mock";
import { Info, X, Music, ShieldOff, Swords } from "lucide-react";

const COMPONENT_MAP: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />,
  gallo: <GalloAvatar />
};

const AVATAR_OPTIONS = [
  ...COMPANIONS_MOCK.map(c => ({
    ...c,
    component: c.id ? COMPONENT_MAP[c.id] : null
  })),
  { 
    id: 'random', 
    name: 'Sorpréndeme', 
    powerName: 'Aleatorio',
    description: 'Selecciona un compañero al azar con un poder misterioso.',
    component: (
      <div className="w-full h-full flex items-center justify-center text-[80px] font-black text-[var(--color-ink)] animate-pulse drop-shadow-[0_4px_0_var(--color-high-yellow)]">
        ?
      </div>
    ), 
    rotation: 0 
  },
];

export function AvatarInventoryWidget() {
  const { selectedAvatar, setSelectedAvatar } = useAvatarStore();
  const [showEffect, setShowEffect] = useState(false);
  const [isGalloUnlocked, setIsGalloUnlocked] = useState(false);
  const [showGalloInfo, setShowGalloInfo] = useState(false);

  useEffect(() => {
    setIsGalloUnlocked(localStorage.getItem('quizsync_unlocked_gallo') === 'true');
  }, []);

  return (
    <div className="w-full relative">
      <div className="mb-12 text-center">
        <h2 className="font-headline text-3xl font-black text-[var(--color-ink)] inline-block relative">
          ELIGE TU COMPAÑERO
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-[var(--color-ink)] opacity-30 transform -rotate-1"></div>
        </h2>
        <p className="mt-4 text-gray-600 font-bold text-sm opacity-80 uppercase tracking-widest">
          Selecciona tu compañero de estudio
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          const isGallo = avatar.id === 'gallo';
          const isLocked = isGallo && !isGalloUnlocked;
          
          return (
            <div
              key={avatar.id}
              className={`polaroid p-4 pb-6 flex flex-col items-center relative ${
                isSelected ? 'selected jitter' : ''
              } ${isLocked ? 'grayscale opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ transform: isSelected ? 'none' : `rotate(${avatar.rotation}deg)` }}
              onClick={() => {
                if (isLocked) {
                  audioManager.playUISound('error');
                  return;
                }
                if (avatar.id === 'random' && selectedAvatar !== 'random') {
                  setShowEffect(true);
                  setTimeout(() => setShowEffect(false), 800);
                }
                setSelectedAvatar(avatar.id as any);
                if (avatar.id !== 'random') {
                  audioManager.playAvatarSound(avatar.id as string);
                } else {
                  audioManager.playUISound('random-select');
                }
              }}
            >
              {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-xl text-center px-4">
                  <div className="text-4xl mb-2">🔒</div>
                  <span className="font-headline font-black text-ink uppercase text-xl leading-tight drop-shadow-md">
                    Acceso<br/>Denegado
                  </span>
                  <span className="font-body font-bold text-xs mt-2 text-ink/90 bg-white border-2 border-ink px-2 py-1 rotate-2 rounded-sm">
                    Soborna al creador
                  </span>
                </div>
              )}

              {!isLocked && isGallo && (
                <button 
                  className="absolute top-2 right-2 z-20 bg-[#D4AF37] text-[#2A050B] p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioManager.playUISound('click');
                    setShowGalloInfo(true);
                  }}
                >
                  <Info size={20} strokeWidth={3} />
                </button>
              )}
              
              <div className="w-full aspect-square bg-white mb-3 flex items-center justify-center relative overflow-visible rounded-xl shadow-inner">
                {avatar.component}
              </div>
              <span className="font-headline text-2xl font-black text-[var(--color-ink)] uppercase">
                {avatar.name}
              </span>
              <span className={`font-body text-xs font-bold uppercase tracking-widest mt-1 mb-2 px-2 py-0.5 rounded-full ${isLocked ? 'bg-gray-400 text-white' : 'text-[var(--color-high-pink)] bg-[var(--color-ink)]'}`}>
                {isLocked ? 'Secreto' : avatar.powerName}
              </span>
              <p className="text-[11px] sm:text-xs text-gray-600 font-medium text-center leading-tight">
                {isLocked ? '???' : avatar.description}
              </p>
            </div>
          );
        })}
      </div>

      {showEffect && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/10 animate-in fade-in duration-200">
          <div className="animate-bounce -rotate-12">
            <div className="text-[250px] sm:text-[350px] font-black text-[var(--color-high-yellow)] drop-shadow-[15px_15px_0_var(--color-ink)]">
              ?
            </div>
          </div>
        </div>
      )}

      {showGalloInfo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGalloInfo(false)}>
          <div className="bg-[#1A0B2E] border-4 border-[#D4AF37] rounded-2xl max-w-4xl w-full p-6 sm:p-8 relative shadow-[0_0_40px_rgba(212,175,55,0.3)] text-white flex flex-col md:flex-row gap-8 items-center md:items-stretch" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              onClick={() => setShowGalloInfo(false)}
            >
              <X size={28} />
            </button>
            
            {/* Tarjeta del Gallo (Izquierda) */}
            <div className="polaroid-mythic p-4 pb-6 flex flex-col items-center relative w-64 flex-shrink-0 cursor-default">
              <div className="w-full aspect-square bg-white mb-3 flex items-center justify-center relative overflow-visible rounded-xl shadow-inner">
                <GalloAvatar />
              </div>
              <span className="font-headline text-2xl font-black text-[var(--color-ink)] uppercase">
                GALLO
              </span>
              <span className="font-body text-xs font-bold uppercase tracking-widest mt-1 mb-2 px-2 py-0.5 rounded-full text-[var(--color-high-pink)] bg-[var(--color-ink)]">
                REY DEL GALLINERO
              </span>
              <p className="text-[11px] sm:text-xs text-gray-600 font-medium text-center leading-tight">
                Silencia a todos los demás jugadores.
              </p>
            </div>

            {/* Detalles y Habilidades (Derecha) */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center md:text-left mb-6">
                <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-1 block">Rareza Mítica</span>
                <h2 className="font-headline text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  EL REY DEL GALLINERO
                </h2>
              </div>

              <div className="space-y-4 text-sm text-gray-200 font-medium overflow-y-auto max-h-[40vh] md:max-h-none pr-2">
                <div className="bg-black/30 p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-base mb-1 flex items-center gap-2">
                    <Music size={18} className="text-[#D4AF37]" /> Tema Exclusivo & Aura
                  </h3>
                  <p className="text-xs">Desbloquea una banda sonora exclusiva y un efecto visual majestuoso en tu pantalla.</p>
                </div>

                <div className="bg-black/30 p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-base mb-1 flex items-center gap-2">
                    <ShieldOff size={18} className="text-[#D4AF37]" /> Supresión de Magia
                  </h3>
                  <p className="text-xs">Activar tu poder silencia e inhabilita las habilidades de tus rivales.</p>
                </div>

                <div className="bg-black/30 p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-base mb-1 flex items-center gap-2">
                    <Swords size={18} className="text-[#D4AF37]" /> Duelo de Reyes
                  </h3>
                  <p className="text-xs">Inmune a otros Reyes. Si cantas tras otro Rey, rompes su maldición y restauras los poderes de la sala.</p>
                </div>
              </div>

              <button 
                className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#2A050B] font-bold font-headline text-lg py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setShowGalloInfo(false)}
              >
                ¡ENTENDIDO, MAJESTAD!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
