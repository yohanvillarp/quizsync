import { useAvatarStore } from "@/shared/store/useAvatarStore";
import { useAchievementsStore } from "@/entities/achievements/model/useAchievementsStore";
import { getAvatarComponent } from "@/entities/player/registry/avatarRegistry";
import { useState } from "react";
import { audioManager } from "@/core/audio/AudioManager";
import { COMPANIONS_MOCK } from "@/entities/player/model/companions.mock";
import { Info, X, Music, ShieldOff, Swords, Trophy } from "lucide-react";
import { AchievementsModal } from "@/features/achievements/ui/AchievementsModal";

const AVATAR_OPTIONS = [
  ...COMPANIONS_MOCK.map(c => ({
    ...c,
    component: c.id ? getAvatarComponent(c.id) : null
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
    rotation: 0,
    rarity: 'common'
  },
];

export function AvatarInventoryWidget() {
  const { selectedAvatar, setSelectedAvatar } = useAvatarStore();
  const { unlockedAvatars } = useAchievementsStore();
  const [showEffect, setShowEffect] = useState(false);
  const [showGalloInfo, setShowGalloInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'common' | 'mythic'>('common');
  const [showMissions, setShowMissions] = useState(false);

  const filteredAvatars = AVATAR_OPTIONS.filter(avatar => avatar.rarity === activeTab);

  return (
    <div className="w-full relative">
      <div className="mb-8 text-center">
        <h2 className="font-headline text-3xl sm:text-4xl font-black text-[var(--color-ink)] inline-block relative mt-2 sm:mt-0">
          ELIGE TU COMPAÑERO
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-[var(--color-ink)] opacity-30 transform -rotate-1"></div>
        </h2>
        <p className="mt-4 text-gray-600 font-bold text-xs sm:text-sm opacity-80 uppercase tracking-widest">
          Selecciona tu compañero de estudio
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center mb-8 gap-6">
        <div className="inline-flex bg-white border-4 border-ink rounded-xl p-1 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <button
            onClick={() => setActiveTab('common')}
            className={`px-6 py-2 font-headline font-black text-lg uppercase transition-colors rounded-lg ${
              activeTab === 'common' 
                ? 'bg-ink text-white' 
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            Comunes
          </button>
          <button
            onClick={() => setActiveTab('mythic')}
            className={`px-6 py-2 font-headline font-black text-lg uppercase transition-colors rounded-lg flex items-center gap-2 ${
              activeTab === 'mythic' 
                ? 'bg-[#FF9800] text-ink' 
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            Míticos
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${activeTab === 'mythic' ? 'text-ink' : 'text-[#FF9800]'}`}>
              <path d="M12 2L2 10L12 22L22 10L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Misiones Button here */}
        <button 
          onClick={() => {
            audioManager.playUISound('click');
            setShowMissions(true);
          }}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-ink border-4 border-ink shadow-[4px_4px_0px_var(--color-ink)] px-4 py-3 rounded-xl font-headline font-black uppercase transition-transform active:translate-y-1 active:shadow-none"
        >
          <Trophy size={20} />
          Misiones
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
        {filteredAvatars.map((avatar) => {
          const isGallo = avatar.id === 'gallo';
          const isEpic = avatar.rarity === 'mythic';
          const isLocked = isEpic && !unlockedAvatars[avatar.id!];
          const isSelected = selectedAvatar === avatar.id && !isLocked;
          
          return (
            <div
              key={avatar.id}
              className={`${isEpic ? 'polaroid-mythic' : 'polaroid'} p-4 pb-6 flex flex-col items-center relative ${
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
              
              <div className={`w-full aspect-square bg-white mb-3 flex items-center justify-center relative overflow-visible rounded-xl shadow-inner ${isEpic ? 'p-2' : ''}`}>
                <div className={`w-full h-full flex items-center justify-center ${isEpic ? 'scale-90' : ''}`}>
                  {avatar.component}
                </div>
              </div>
              <span className="font-headline text-2xl font-black text-[var(--color-ink)] uppercase tracking-tight">
                {avatar.name}
              </span>
              <span className={`font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 mb-2 px-3 py-0.5 rounded-full ${isLocked ? 'bg-gray-400 text-white' : (isEpic ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#110204] shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-[var(--color-high-pink)] bg-[var(--color-ink)]')}`}>
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGalloInfo(false)}>
          <div className="bg-[#1A0B2E] border-4 border-[#D4AF37] rounded-2xl max-w-4xl w-full p-5 sm:p-8 relative shadow-[0_0_40px_rgba(212,175,55,0.3)] text-white flex flex-col md:flex-row gap-4 sm:gap-8 items-center md:items-stretch max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors z-10 bg-black/40 rounded-full p-1"
              onClick={() => setShowGalloInfo(false)}
            >
              <X size={24} />
            </button>
            
            <div className="polaroid-mythic p-3 sm:p-4 pb-4 sm:pb-6 flex flex-col items-center relative w-48 sm:w-64 flex-shrink-0 cursor-default shrink-0 mt-4 md:mt-0">
              <div className="w-full aspect-square bg-white mb-2 sm:mb-3 flex items-center justify-center relative overflow-visible rounded-xl shadow-inner scale-90 sm:scale-100">
                {getAvatarComponent('gallo')}
              </div>
              <span className="font-headline text-xl sm:text-2xl font-black text-[var(--color-ink)] uppercase">
                GALLO
              </span>
              <span className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 mb-1 sm:mb-2 px-2 py-0.5 rounded-full text-[var(--color-high-pink)] bg-[var(--color-ink)] text-center">
                REY DEL GALLINERO
              </span>
              <p className="text-[10px] sm:text-[11px] md:text-xs text-gray-600 font-medium text-center leading-tight">
                Silencia a todos los demás jugadores.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center md:text-left mb-4 sm:mb-6">
                <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-1 block">Rareza Mítica</span>
                <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                  EL REY DEL GALLINERO
                </h2>
              </div>

              <div className="space-y-2 sm:space-y-4 text-sm text-gray-200 font-medium">
                <div className="bg-black/30 p-2 sm:p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-2">
                    <Music size={16} className="text-[#D4AF37] shrink-0" /> Tema Exclusivo & Aura
                  </h3>
                  <p className="text-[11px] sm:text-xs">Desbloquea una banda sonora exclusiva y un efecto visual majestuoso en tu pantalla.</p>
                </div>

                <div className="bg-black/30 p-2 sm:p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-2">
                    <ShieldOff size={16} className="text-[#D4AF37] shrink-0" /> Supresión de Magia
                  </h3>
                  <p className="text-[11px] sm:text-xs">Activar tu poder silencia e inhabilita las habilidades de tus rivales.</p>
                </div>

                <div className="bg-black/30 p-2 sm:p-3 rounded-xl border border-[#D4AF37]/30">
                  <h3 className="font-bold text-[#F5D76E] text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-2">
                    <Swords size={16} className="text-[#D4AF37] shrink-0" /> Duelo de Reyes
                  </h3>
                  <p className="text-[11px] sm:text-xs">Inmune a otros Reyes. Si cantas tras otro Rey, rompes su maldición y restauras los poderes de la sala.</p>
                </div>
              </div>

              <button 
                className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#2A050B] font-bold font-headline text-base sm:text-lg py-2 rounded-xl hover:scale-105 active:scale-95 transition-transform"
                onClick={() => setShowGalloInfo(false)}
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
      <AchievementsModal isOpen={showMissions} onClose={() => setShowMissions(false)} />
    </div>
  );
}
