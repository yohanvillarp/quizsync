import { useState } from "react";
import { FoxAvatar, OwlAvatar, BearAvatar, CatAvatar, RabbitAvatar, DogAvatar } from "@/shared/ui/avatars/AvatarIcons";
import { Crown, Edit2, UserMinus, Ban, VolumeX, RotateCcw } from "lucide-react";
import { useRole } from "@/shared/lib/rbac/useRole";

export interface Player {
  socketId: string;
  deviceId: string;
  name: string;
  avatarId: string;
  isHost: boolean;
  connected?: boolean;
  emotesMuted?: boolean;
}

interface PlayerCardProps {
  player: Player;
  emotes?: { id: string; payload: string }[];
  isPoked?: boolean;
  onPoke?: () => void;
  isMe?: boolean;
  onChangeAvatar?: (avatarId: string) => void;
  onTransferHost?: () => void;
  onKick?: () => void;
  onBan?: () => void;
  onMuteEmotes?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  fox: <FoxAvatar />,
  owl: <OwlAvatar />,
  bear: <BearAvatar />,
  cat: <CatAvatar />,
  rabbit: <RabbitAvatar />,
  dog: <DogAvatar />
};

export function PlayerCard({ player, emotes = [], isPoked = false, onPoke, isMe = false, onChangeAvatar, onTransferHost, onKick, onBan, onMuteEmotes }: PlayerCardProps) {
  const { isHost: amIHost } = useRole();
  const [showPicker, setShowPicker] = useState(false);
  const [showAdminPicker, setShowAdminPicker] = useState(false);
  const isHost = player.isHost;
  const isDisconnected = player.connected === false;
  const avatar = ICONS[player.avatarId] || <FoxAvatar />; // Default a fox si no se encuentra

  return (
    <div 
      className={`flex flex-col items-center gap-3 transition-opacity duration-300 relative group
        ${isDisconnected ? 'opacity-50 grayscale' : ''} 
        ${isPoked ? 'animate-shake-violent' : ''}
        ${(onPoke || isMe || amIHost) ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}
      `}
      onClick={() => {
        if (!isDisconnected) {
          if (isMe) setShowPicker(!showPicker);
          else if (amIHost) setShowAdminPicker(!showAdminPicker);
          else if (onPoke) onPoke();
        }
      }}
    >
      {/* Emotes flotantes */}
      {emotes.map((emote) => (
        <div 
          key={emote.id} 
          className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl z-50 pointer-events-none animate-float-up"
          style={{ 
            left: `calc(50% + ${(Math.random() - 0.5) * 40}px)` 
          }}
        >
          {emote.payload}
        </div>
      ))}

      {/* Selector Flotante de Avatar */}
      {isMe && showPicker && (
        <div className="absolute -top-14 sm:-top-16 z-50 bg-white border-4 border-[var(--color-ink)] p-1 sm:p-2 rounded-3xl flex gap-0.5 sm:gap-1 shadow-[4px_4px_0px_var(--color-ink)] animate-in zoom-in duration-200">
          {Object.keys(ICONS).map((key) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                if (onChangeAvatar) onChangeAvatar(key);
                setShowPicker(false);
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors border-2 ${player.avatarId === key ? 'border-[var(--color-ink)] bg-[var(--color-high-yellow)]' : 'border-transparent'}`}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 pointer-events-none flex items-center justify-center">
                {ICONS[key]}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Menú Flotante de Administración (Host) */}
      {!isMe && amIHost && showAdminPicker && (
        <div className="absolute -top-14 sm:-top-16 z-50 bg-white border-4 border-[var(--color-ink)] p-1 sm:p-2 rounded-3xl flex flex-wrap justify-center gap-1 shadow-[4px_4px_0px_var(--color-ink)] animate-in zoom-in duration-200 max-w-[180px] sm:max-w-none">
          {!isHost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onTransferHost) onTransferHost();
                setShowAdminPicker(false);
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-[var(--color-high-yellow)] hover:bg-yellow-300 border-2 border-[var(--color-ink)] transition-colors"
              title="Dar Host"
            >
              <Crown size={18} className="text-[var(--color-ink)] sm:!w-5 sm:!h-5 md:!w-6 md:!h-6" strokeWidth={2.5} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onKick) onKick();
              setShowAdminPicker(false);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-orange-400 hover:bg-orange-500 border-2 border-[var(--color-ink)] transition-colors"
            title="Expulsar Jugador (Puede volver)"
          >
            <UserMinus size={18} className="text-white sm:!w-5 sm:!h-5 md:!w-6 md:!h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onMuteEmotes) onMuteEmotes();
              setShowAdminPicker(false);
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border-2 border-[var(--color-ink)] transition-colors ${player.emotesMuted ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            title={player.emotesMuted ? "Restablecer Emotes" : "Silenciar Emotes"}
          >
            {player.emotesMuted
              ? <RotateCcw size={18} className="text-white sm:!w-5 sm:!h-5 md:!w-6 md:!h-6" strokeWidth={2.5} />
              : <VolumeX size={18} className="text-white sm:!w-5 sm:!h-5 md:!w-6 md:!h-6" strokeWidth={2.5} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onBan) onBan();
              setShowAdminPicker(false);
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 border-2 border-[var(--color-ink)] transition-colors"
            title="Vetar Jugador (No puede volver)"
          >
            <Ban size={18} className="text-white sm:!w-5 sm:!h-5 md:!w-6 md:!h-6" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Contenedor del Avatar (Sketch Card Style) */}
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-3xl border-4 border-[var(--color-ink)] flex items-center justify-center p-2 sm:p-3 md:p-4 transition-all
        ${isHost ? 'bg-[var(--color-high-yellow)] shadow-[4px_4px_0px_var(--color-ink)] sm:shadow-[6px_6px_0px_var(--color-ink)]' : 'bg-white shadow-[3px_3px_0px_var(--color-ink)] sm:shadow-[4px_4px_0px_var(--color-ink)]'}
      `}>
        {/* Etiqueta de Host */}
        {isHost && (
          <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-[var(--color-high-pink)] border-2 border-[var(--color-ink)] rounded-full p-1 sm:p-1.5 shadow-[2px_2px_0px_var(--color-ink)] rotate-12 z-10 pointer-events-none">
            <Crown size={16} className="text-[var(--color-ink)] sm:!w-[18px] sm:!h-[18px] md:!w-5 md:!h-5" strokeWidth={3} />
          </div>
        )}
        
        {/* Etiqueta de Desconectado */}
        {isDisconnected && (
          <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 bg-gray-200 border-2 border-[var(--color-ink)] rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-[2px_2px_0px_var(--color-ink)] -rotate-6 z-10 pointer-events-none">
            <span className="font-headline font-bold text-[var(--color-ink)] text-[10px] sm:text-xs uppercase">Desconectado</span>
          </div>
        )}

        {/* Etiqueta de Editar (solo visible al hacer hover si eres tú) */}
        {isMe && !showPicker && !isDisconnected && (
          <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-[var(--color-ink)] rounded-full p-1 sm:p-1.5 shadow-[2px_2px_0px_var(--color-ink)] z-20 pointer-events-none">
            <Edit2 size={14} className="text-[var(--color-ink)] sm:!w-4 sm:!h-4" strokeWidth={3} />
          </div>
        )}
        
        {/* El Avatar en sí. Le agregamos la clase "selected" para que se anime */}
        <div className={`w-full h-full flex items-center justify-center pointer-events-none ${isDisconnected ? '' : 'selected'}`}>
          {avatar}
        </div>
      </div>

      {/* Etiqueta con el nombre */}
      <div className={`px-3 sm:px-4 py-1 sm:py-2 border-2 border-[var(--color-ink)] rounded-xl transform -rotate-2 pointer-events-none
        ${isHost ? 'bg-[var(--color-ink)] text-white shadow-[3px_3px_0px_var(--color-high-yellow)]' : 'bg-[var(--color-paper-dim)] text-[var(--color-ink)] shadow-[3px_3px_0px_var(--color-ink)]'}
      `}>
        <span className="font-headline font-black uppercase text-xs sm:text-sm md:text-base tracking-wider block max-w-[70px] sm:max-w-[90px] md:max-w-[120px] truncate text-center">
          {player.name}
        </span>
      </div>
    </div>
  );
}
