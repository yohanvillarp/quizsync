import { CreateGameButton } from "@/features/create-game/ui/CreateGameButton";
import { JoinGameForm } from "@/features/join-game/ui/JoinGameForm";
import { BrowseGamesButton } from "@/features/browse-public-games/ui/BrowseGamesButton";
import { PublicGamesModal } from "@/features/browse-public-games/ui/PublicGamesModal";
import { Logo } from "@/shared/ui/Logo";
import { Backpack, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveAvatarWidget } from "@/widgets/active-avatar/ui/ActiveAvatarWidget";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";
import { useEffect, useState } from "react";
import { engineClient } from "@/shared/api/engineClient";
import { Play, Trash2, X, AlertCircle } from "lucide-react";
import { SoundButton } from "@/shared/ui/SoundButton";
import { AchievementsModal } from "@/features/achievements/ui/AchievementsModal";

export function HomePage() {
  const navigate = useNavigate();
  const [isPublicGamesOpen, setIsPublicGamesOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{roomId: string, quizTitle: string} | null>(null);
  const [showActiveRoomModal, setShowActiveRoomModal] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const [showMissions, setShowMissions] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check for active room
    let deviceId = localStorage.getItem('quizsync_device_id');
    if (deviceId) {
      engineClient.get(`/rooms/active-host/${deviceId}`)
        .then(res => {
          if (mounted && res.data) {
            setActiveRoom(res.data);
          }
        })
        .catch(() => {
          // Normal 404 if no room
        });
    }

    return () => { mounted = false; };
  }, []);

  const handleDestroyRoom = async () => {
    if (!activeRoom) return;
    setIsDestroying(true);
    try {
      const deviceId = localStorage.getItem('quizsync_device_id');
      await engineClient.delete(`/rooms/${activeRoom.roomId}?hostId=${deviceId}`);
      setActiveRoom(null);
      setShowActiveRoomModal(false);
    } catch (error) {
      console.error("Error destroying room:", error);
    } finally {
      setIsDestroying(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pb-20 sm:pb-24 overflow-y-auto z-10 w-full">
      <AudioVisualizerWidget />

      {/* Botón de Inventario (Esquina superior izquierda) */}
      <SoundButton 
        clickSound="click"
        onClick={() => navigate('/inventory')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] sm:hover:shadow-[8px_8px_0px_0px_var(--color-ink-offset)] hover:bg-[var(--color-high-yellow)] transition-all font-bold text-base sm:text-lg"
      >
        <Backpack size={20} strokeWidth={2.5} className="sm:!w-6 sm:!h-6" />
        <span className="hidden sm:inline">Inventario</span>
      </SoundButton>

      {/* Botón de Misiones (Esquina superior derecha, ajustado para no chocar con el control de audio) */}
      <SoundButton 
        clickSound="click"
        onClick={() => setShowMissions(true)}
        className="absolute top-4 right-24 sm:top-6 sm:right-28 z-50 flex items-center gap-2 bg-yellow-400/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] sm:hover:shadow-[8px_8px_0px_0px_var(--color-ink-offset)] hover:bg-yellow-300 transition-all font-bold text-base sm:text-lg text-ink"
      >
        <Trophy size={20} strokeWidth={2.5} className="sm:!w-6 sm:!h-6" />
        <span className="hidden sm:inline uppercase">Misiones</span>
      </SoundButton>
      
      {/* Central Action Area */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col items-center gap-3 sm:gap-5 z-10 flex-shrink-0">
        {/* Hand-drawn Title */}
        <div className="text-center mb-4 sm:mb-6">
          <Logo />
        </div>

        {/* Feature: Join Game */}
        <JoinGameForm />

        {/* Feature: Browse + Create (same row) */}
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 mt-1">
          <BrowseGamesButton onClick={() => setIsPublicGamesOpen(true)} />
          <CreateGameButton />
        </div>

      </div>

      {/* Active Room Floating Widget */}
      {activeRoom && (
        <SoundButton
          hoverSound="hover"
          onClick={() => setShowActiveRoomModal(true)}
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 flex items-center gap-3 bg-[var(--color-high-yellow)] border-4 border-black px-4 py-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-bounce"
        >
          <div className="bg-white p-2 rounded-full border-2 border-black">
            <AlertCircle size={24} className="text-black" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-lg leading-none">Sala Activa</span>
            <span className="font-body font-bold text-xs opacity-70 truncate max-w-[150px]">
              {activeRoom.quizTitle}
            </span>
          </div>
        </SoundButton>
      )}

      {/* Active Room Modal */}
      {showActiveRoomModal && activeRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 duration-200 relative flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-[var(--color-high-yellow)] rounded-2xl border-4 border-black flex items-center justify-center mb-6 rotate-3">
              <AlertCircle size={32} />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl mb-2">¡Tienes una sala fantasma!</h2>
            <p className="font-body font-bold text-gray-600 mb-8 text-sm sm:text-base">
              Creaste la sala <strong>"{activeRoom.quizTitle}"</strong> pero regresaste al menú. ¿Qué deseas hacer con ella?
            </p>

            <div className="flex flex-col w-full gap-3">
              <SoundButton 
                clickSound="confirm"
                onClick={() => navigate(`/lobby/${activeRoom.roomId}`)}
                className="w-full bg-[var(--color-neon-green)] text-black border-4 border-black font-display text-xl py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
              >
                <Play size={24} fill="currentColor" /> Volver a la Sala
              </SoundButton>

              <SoundButton 
                clickSound="error"
                onClick={handleDestroyRoom}
                disabled={isDestroying}
                className="w-full bg-[#FF4747] text-white border-4 border-black font-display text-xl py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={24} /> {isDestroying ? "Destruyendo..." : "Destruir Sala"}
              </SoundButton>

              <SoundButton 
                clickSound="click"
                onClick={() => setShowActiveRoomModal(false)}
                className="w-full bg-gray-100 text-gray-500 border-4 border-gray-300 font-display text-lg py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <X size={20} /> Ignorar
              </SoundButton>
            </div>
            
          </div>
        </div>
      )}

      {/* Active Avatar Buddy */}
      <ActiveAvatarWidget />

      {/* Modals */}
      <PublicGamesModal 
        isOpen={isPublicGamesOpen} 
        onClose={() => setIsPublicGamesOpen(false)} 
        onJoin={(code) => {
          setIsPublicGamesOpen(false);
          navigate(`/lobby/${code}`);
        }}
      />

      <AchievementsModal 
        isOpen={showMissions} 
        onClose={() => setShowMissions(false)} 
      />
    </main>
  );
}
