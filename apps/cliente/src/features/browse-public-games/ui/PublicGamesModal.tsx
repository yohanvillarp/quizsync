import { X, Globe2, RefreshCw, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { engineClient } from "@/shared/api/engineClient";
import { SoundButton } from "@/shared/ui/SoundButton";

interface PublicGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

interface PublicRoom {
  id: string;
  quizTitle: string;
  categoryName: string;
  playersCount: number;
  maxPlayers: number;
}

export function PublicGamesModal({ isOpen, onClose, onJoin }: PublicGamesModalProps) {
  const [games, setGames] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const res = await engineClient.get('/rooms');
      setGames(res.data);
    } catch (err) {
      console.error("Error cargando partidas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (isOpen) {
      fetchGames(); // Fetch inicial al abrir
      
      // Auto-refresh cada 10 segundos
      intervalId = setInterval(() => {
        fetchGames();
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, fetchGames]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#E0E7FF] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3730A3]">
            <Globe2 size={28} strokeWidth={2.5} />
            <h2 className="font-display text-2xl uppercase tracking-wide">Partidas Públicas</h2>
          </div>
          
          <div className="flex items-center gap-1">
            <SoundButton 
              clickSound="click"
              onClick={fetchGames}
              disabled={loading}
              className={`p-2 hover:bg-[#3730A3]/10 text-[#3730A3] rounded-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Recargar lista"
            >
              <RefreshCw size={24} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
            </SoundButton>
            
            <SoundButton 
              clickSound="click"
              onClick={onClose}
              className="p-2 hover:bg-black/10 rounded-lg transition-colors text-[var(--color-ink)]"
            >
              <X size={28} strokeWidth={2.5} />
            </SoundButton>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-3">
          {loading ? (
            <p className="text-center font-body text-gray-500 py-8 font-bold">Buscando partidas...</p>
          ) : games.length === 0 ? (
            <p className="text-center font-body text-gray-500 py-8 font-bold">No hay partidas públicas activas en este momento.</p>
          ) : (
            games.map((game) => (
              <div key={game.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-xl hover:bg-gray-100 transition-colors gap-4">
                <div className="flex flex-col">
                  <span className="font-display text-xl text-black truncate max-w-[200px] sm:max-w-[250px]">{game.quizTitle}</span>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600 font-body font-bold text-sm mt-1">
                    <span className="bg-gray-200 px-2 py-0.5 rounded-md border border-gray-300">{game.categoryName}</span>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{game.playersCount} / {game.maxPlayers} Jugadores</span>
                    </div>
                  </div>
                </div>
                
                <SoundButton 
                  clickSound="confirm"
                  onClick={() => onJoin(game.id)}
                  disabled={game.playersCount >= game.maxPlayers}
                  className="px-6 py-2 w-full sm:w-auto bg-[var(--color-high-yellow)] border-2 border-black rounded-lg font-display text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none text-black"
                >
                  Unirse
                </SoundButton>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
