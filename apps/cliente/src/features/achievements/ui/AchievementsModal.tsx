import { audioManager } from '@/core/audio/AudioManager';
import { useAchievementsStore } from '@/entities/achievements/model/useAchievementsStore';
import { getAvatarComponent, getAvatarData } from '@/entities/player/registry/avatarRegistry';
import { CheckCircle, Lock, Trophy, X } from 'lucide-react';

interface Mission {
  id: string;
  avatarId: string;
  title: string;
  hint: string;
}

const MISSIONS: Mission[] = [
  {
    id: 'mission_chameleon',
    avatarId: 'chameleon',
    title: 'Múltiples Caras',
    hint: 'Aquel que prueba diferentes formas, encuentra la suya (Juega con 3 personajes).'
  },
  {
    id: 'mission_peacock',
    avatarId: 'peacock',
    title: 'Rey del Podio',
    hint: 'La cima es el único lugar aceptable al final del juego.'
  },
  {
    id: 'mission_dragon',
    avatarId: 'dragon',
    title: 'Caos Absoluto',
    hint: 'Desata tus poderes repetidas veces para invocar a la bestia (Usa 5 poderes).'
  },
  {
    id: 'mission_bat',
    avatarId: 'bat',
    title: 'Visión Verdadera',
    hint: 'Incluso bajo el ataque de un rival, tu mente debe brillar.'
  },
  {
    id: 'mission_gallo',
    avatarId: 'gallo',
    title: 'Palabra Mágica',
    hint: 'El que manda tiene nombre propio...'
  }
];

export const AchievementsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { unlockedAvatars } = useAchievementsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-2xl w-full rounded-3xl border-4 border-ink shadow-[8px_8px_0px_var(--color-ink)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-ink text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <Trophy size={32} className="text-yellow-400" />
            <div>
              <h2 className="font-display font-black text-3xl uppercase tracking-wider">Misiones Secretas</h2>
              <p className="font-body text-white/80 font-medium text-sm">Completa tareas para desbloquear compañeros míticos</p>
            </div>
          </div>
          <button 
            onClick={() => {
              audioManager.playUISound('click');
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[var(--color-paper)]">
          <div className="grid gap-4">
            {MISSIONS.map(mission => {
              const isUnlocked = unlockedAvatars[mission.avatarId];
              const data = getAvatarData(mission.avatarId);

              return (
                <div 
                  key={mission.id}
                  className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-4 transition-all ${
                    isUnlocked 
                      ? 'border-green-600 bg-green-50 shadow-[4px_4px_0px_var(--color-ink)]' 
                      : 'border-ink/20 bg-white shadow-sm'
                  }`}
                >
                  {/* Icon Area */}
                  <div className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center border-4 ${
                    isUnlocked ? 'border-green-600 bg-white' : 'border-ink/20 bg-gray-100 grayscale opacity-50'
                  }`}>
                    {getAvatarComponent(mission.avatarId)}
                  </div>

                  {/* Text Area */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      {isUnlocked ? <CheckCircle size={20} className="text-green-600" /> : <Lock size={20} className="text-ink/40" />}
                      <h3 className={`font-headline font-black text-xl uppercase ${isUnlocked ? 'text-green-800' : 'text-ink/60'}`}>
                        {mission.title}
                      </h3>
                    </div>
                    
                    <p className="font-body font-bold text-ink/70 text-sm mb-2">
                      {mission.hint}
                    </p>
                    
                    <div className="inline-block bg-white border-2 border-ink/20 px-3 py-1 rounded-full">
                      <span className="font-body font-bold text-xs text-ink/60 uppercase">Recompensa: </span>
                      <span className={`font-headline font-black text-sm uppercase ${isUnlocked ? 'text-green-700' : 'text-ink/80'}`}>
                        {isUnlocked ? data.name : '???'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
