import { useEffect } from "react";
import type { PodiumPlayer } from "@/entities/game/model/types";
import { PodiumWidget } from "@/widgets/podium/ui/PodiumWidget";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { Home, Trash2, List, Trophy, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/entities/game/model/useGameStore";
import { socketClient } from "@/shared/api/ws/socket.client";
import { RankingBoard } from "@/widgets/game-board/ui/RankingBoard";
import { useState } from "react";

export function PodiumPage() {
  const navigate = useNavigate();
  const [showRanking, setShowRanking] = useState(false);
  const { players, isHost, gameStatus, disconnect, roomId, categoryName } = useGameStore();

  // Redirigir al inicio si no hay datos de juego
  useEffect(() => {
    if (gameStatus === 'LOBBY' && roomId) {
      navigate(`/lobby/${roomId}`);
      return;
    }
    if (gameStatus !== 'FINISHED' && gameStatus !== 'LOBBY') {
      navigate('/');
    }

    const handleRoomDestroyed = (data: { message: string }) => {
      useAlertStore.getState().showAlert(data.message, "Sala Destruida");
      disconnect();
      navigate("/");
    };

    socketClient.on("room_destroyed", handleRoomDestroyed);

    return () => {
      socketClient.off("room_destroyed", handleRoomDestroyed);
    };
  }, [gameStatus, roomId, navigate, disconnect]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const podiumData: PodiumPlayer[] = sortedPlayers.map((p, i) => ({
    id: p.deviceId,
    username: p.name,
    avatarId: p.avatarId as import("@/shared/store/useAvatarStore").AvatarType,
    score: p.score,
    rank: (i + 1) as 1 | 2 | 3
  }));

  const rankingPlayers = sortedPlayers.map(p => ({
    id: p.deviceId,
    name: p.name,
    score: p.score,
    hasAnswered: true, // Fin del juego
    isMe: p.deviceId === localStorage.getItem('quizsync_device_id')
  }));

  const handleLeave = () => {
    disconnect();
    navigate('/');
  };

  const handleEndRoom = async () => {
    const confirmed = await useAlertStore.getState().showConfirm("¿Seguro que deseas destruir la sala? Esto expulsará a todos.", "Destruir Sala");
    if (confirmed) {
      const deviceId = localStorage.getItem('quizsync_device_id');
      socketClient.emit('destroy_room', { roomId, hostId: deviceId });
      disconnect();
      navigate('/');
    }
  };

  const handleReturnToLobby = async () => {
    const confirmed = await useAlertStore.getState().showConfirm("¿Volver al Lobby para jugar otra ronda?", "Jugar de Nuevo");
    if (confirmed) {
      try {
        await useGameStore.getState().returnToLobby();
      } catch (error) {
        useAlertStore.getState().showAlert(String(error), "Error");
      }
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center pt-16 px-4 md:px-8 pb-8 relative">
      
      {/* Controles */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center z-50">
        <button 
          onClick={handleLeave}
          className="p-2.5 sm:p-3 bg-white border-[3px] sm:border-2 border-[var(--color-ink)] rounded-xl shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 font-headline font-bold text-sm sm:text-base"
        >
          <Home size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Inicio</span>
        </button>

        {isHost && (
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={handleReturnToLobby}
              className="p-2.5 sm:p-3 bg-[var(--color-high-yellow)] border-[3px] sm:border-2 border-[var(--color-ink)] rounded-xl shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 font-headline font-bold text-sm sm:text-base"
            >
              <RotateCcw size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Volver al Lobby</span>
            </button>
            <button 
              onClick={handleEndRoom}
              className="p-2.5 sm:p-3 bg-[var(--color-high-pink)] border-[3px] sm:border-2 border-[var(--color-ink)] rounded-xl shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 font-headline font-bold text-[var(--color-ink)] text-sm sm:text-base"
            >
              <Trash2 size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Destruir Sala</span>
            </button>
          </div>
        )}
      </div>

      {/* Victory Title */}
      <div className="text-center mb-8 transform rotate-1 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <h1 className="text-4xl md:text-6xl font-headline font-black text-[var(--color-ink)] uppercase tracking-tighter">
          Resultados Finales
        </h1>
        <p className="font-body text-[var(--color-ink)] opacity-80 font-bold max-w-md mx-auto mt-4 text-lg">
          ¡Lápices abajo! Aquí están las mentes maestras en la categoría de <span className="text-[var(--color-high-pink)] font-black">{categoryName || 'Trivia'}</span>.
        </p>
      </div>

      {/* Podium or Ranking Toggle */}
      <div className="mb-6 z-10 animate-in fade-in duration-500">
        <button
          onClick={() => setShowRanking(!showRanking)}
          className="px-6 py-3 bg-[var(--color-high-yellow)] border-4 border-[var(--color-ink)] rounded-full font-headline font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all uppercase"
        >
          {showRanking ? <><Trophy size={20}/> Ver Podio</> : <><List size={20}/> Ver Ranking Completo</>}
        </button>
      </div>

      {/* Components */}
      <div className="w-full animate-in zoom-in-95 duration-500 flex justify-center">
        {showRanking ? (
          <RankingBoard players={rankingPlayers} />
        ) : (
          <PodiumWidget players={podiumData} roomId={roomId!} />
        )}
      </div>

    </main>
  );
}
