import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Copy, Check, Play, Edit3, Share2 } from "lucide-react";
import { Logo } from "@/shared/ui/Logo";
import { useAvatarStore, type AvatarType } from "@/shared/store/useAvatarStore";
import { useSessionStore } from "@/shared/store/useSessionStore";
import { useGameStore } from "@/entities/game/model/useGameStore";
import { socketClient } from "@/shared/api/ws/socket.client";
import { RoleGuard } from "@/shared/lib/rbac/RoleGuard";
import { AVAILABLE_EMOTES } from "@/shared/config/emotes";
import { PlayerCard } from "@/entities/player/ui/PlayerCard";
import { Loader } from "@/shared/ui/Loader/Loader";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { HomeButton } from "@/shared/ui/HomeButton";
import { apiClient } from "@/shared/api/apiClient";
import { SoundButton } from "@/shared/ui/SoundButton";

export function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const nameKey = `quizsync_player_name_${code}`;
  
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(nameKey) || "");
  const [hasJoined, setHasJoined] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  
  // Interacciones
  const [activeEmotes, setActiveEmotes] = useState<{ id: string; targetId: string; payload: string }[]>([]);
  const [activePokes, setActivePokes] = useState<string[]>([]);

  // Estado modular de sesión y juego
  const { setRole, initializeDeviceId } = useSessionStore();
  const { 
    connect, 
    joinRoom, 
    checkRoom, 
    banPlayer, 
    kickPlayer,
    transferHost,
    changeAvatar,
    emitEmote, 
    emitPoke,
    startGame,
    players, 
    isConnected,
    isHost,
    gameStatus,
    updateCategory,
    destroyRoom,
    categoryName
  } = useGameStore();

  useEffect(() => {
    apiClient.get("/quizzes/categories?hasQuestions=true")
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const engineWsUrl = import.meta.env.VITE_ENGINE_WS_URL || 'http://localhost:3002';
    connect(engineWsUrl);
    
    // Funciones de callback
    const onKicked = () => {
      useAlertStore.getState().showAlert("Has sido expulsado de la sala.", "Expulsado");
      navigate("/");
    };

    const onBanned = () => {
      useAlertStore.getState().showAlert("Has sido vetado de esta sala permanentemente.", "Vetado");
      navigate("/");
    };

    const onRoomDestroyed = (data: { message: string }) => {
      useAlertStore.getState().showAlert(data.message, "Sala Cerrada");
      navigate("/");
    };

    const onPlayerAction = (data: { actionType: string; targetId: string; payload: string }) => {
      if (data.actionType === 'emote') {
        const id = Math.random().toString();
        setActiveEmotes(prev => [...prev, { id, targetId: data.targetId, payload: data.payload }]);
        setTimeout(() => {
          setActiveEmotes(prev => prev.filter(e => e.id !== id));
        }, 1500);
      } else if (data.actionType === 'poke') {
        setActivePokes(prev => [...prev, data.targetId]);
        setTimeout(() => {
          setActivePokes(prev => prev.filter(id => id !== data.targetId));
        }, 400);
      }
    };

    // Listeners para UI events (como los emotes) que no van en el store global
    socketClient.on("you_were_kicked", onKicked);
    socketClient.on("you_were_banned", onBanned);
    socketClient.on("room_destroyed", onRoomDestroyed);
    socketClient.on("player_action_received", onPlayerAction);

    return () => {
      socketClient.off("you_were_kicked", onKicked);
      socketClient.off("you_were_banned", onBanned);
      socketClient.off("room_destroyed", onRoomDestroyed);
      socketClient.off("player_action_received", onPlayerAction);
    };
  }, [connect, navigate]);

  // Redirección al juego si el estado cambia
  useEffect(() => {
    if (gameStatus !== 'LOBBY' && hasJoined) {
      navigate(`/game/${code}`);
    }
  }, [gameStatus, hasJoined, code, navigate]);

  useEffect(() => {
    const verifyAndJoin = async () => {
      if (!code || !isConnected) return;
      
      const deviceId = initializeDeviceId();
      const response = await checkRoom(code, deviceId);
      
      if (!response || !response.exists) {
        useAlertStore.getState().showAlert("La sala no existe o ha sido cerrada.");
        navigate("/");
        return;
      }

      if (response.isBanned) {
        useAlertStore.getState().showAlert("Estás vetado de esta sala y no puedes volver a ingresar.");
        navigate("/");
        return;
      }

      const savedName = localStorage.getItem(nameKey);
      if (savedName) {
        let avatarId: AvatarType = useAvatarStore.getState().selectedAvatar || 'fox';
        if (!avatarId || avatarId === 'random') {
          const keys: AvatarType[] = ['fox', 'owl', 'bear', 'cat', 'rabbit', 'dog'];
          avatarId = keys[Math.floor(Math.random() * keys.length)];
        }

        const joinRes = await joinRoom(code as string, savedName, avatarId as string, deviceId);
        if (joinRes && joinRes.status === 'success') {
          setRole(joinRes.isHost ? 'host' : 'player');
          setHasJoined(true);
        } else {
          localStorage.removeItem(nameKey);
        }
      }
      setIsVerifying(false);
    };

    verifyAndJoin();
  }, [code, isConnected, checkRoom, joinRoom, navigate, initializeDeviceId, nameKey, setRole]);

  // Sincronizar permisos de host transferidos en tiempo real
  useEffect(() => {
    if (hasJoined) {
      setRole(isHost ? 'host' : 'player');
    }
  }, [isHost, hasJoined, setRole]);



  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !code) return;

    if (!playerName.trim()) return;

    localStorage.setItem(nameKey, playerName);
    const avatarId = useAvatarStore.getState().selectedAvatar || 'random';
    const deviceId = initializeDeviceId();

    const response = await joinRoom(code as string, playerName, avatarId as string, deviceId);
    if (response && response.status === 'success') {
      setRole(response.isHost ? 'host' : 'player');
      setHasJoined(true);
    } else {
      useAlertStore.getState().showAlert((response as any)?.message || "Error al unirse a la sala", "Error");
    }
  };

  const handleCopy = () => {
    const url = window.location.href;
    try {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(url);
      });
    } catch {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      useAlertStore.getState().showAlert('No se pudo copiar. Copia manualmente: ' + text, 'Error');
    }
    document.body.removeChild(textarea);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`¡Únete a mi sala en QuizSync!\n\nCódigo: ${code}\nEnlace: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleChangeAvatar = (avatarId: string) => {
    changeAvatar(avatarId);
    useAvatarStore.getState().setSelectedAvatar(avatarId as AvatarType);
  };

  const lastEmoteTime = useRef(0);
  const handleEmote = (emoteId: string) => {
    const now = Date.now();
    if (now - lastEmoteTime.current < 150) return; // 150ms cooldown
    lastEmoteTime.current = now;
    const myDeviceId = localStorage.getItem('quizsync_device_id') || '';
    emitEmote(myDeviceId, emoteId);
  };

  const lastPokeTime = useRef(0);
  const handlePoke = (targetId: string) => {
    const now = Date.now();
    if (now - lastPokeTime.current < 1000) return; // 1s cooldown
    lastPokeTime.current = now;
    emitPoke(targetId);
  };

  const handleBan = async (targetId: string) => {
    const confirmed = await useAlertStore.getState().showConfirm("¿Estás seguro que deseas vetar a este jugador de la sala? No podrá volver a ingresar.", "Vetar Jugador");
    if (confirmed) {
      banPlayer(targetId);
    }
  };

  const [isStarting, setIsStarting] = useState(false);

  const handleTransferHost = async (targetId: string) => {
    const confirmed = await useAlertStore.getState().showConfirm("¿Transferir los privilegios de anfitrión a este jugador?", "Transferir Host");
    if (confirmed) {
      transferHost(targetId);
    }
  };

  const handleKickPlayer = async (targetId: string) => {
    const confirmed = await useAlertStore.getState().showConfirm("¿Expulsar a este jugador? Podrá volver a entrar si tiene el código.", "Expulsar Jugador");
    if (confirmed) {
      kickPlayer(targetId);
    }
  };

  const handleStartGame = () => {
    if (isStarting) return;
    setIsStarting(true);
    startGame();
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    try {
      await updateCategory(newCategory);
      useAlertStore.getState().showAlert("¡Tema actualizado exitosamente!", "Nuevo Tema");
    } catch (error) {
      useAlertStore.getState().showAlert(String(error), "Error al cambiar tema");
    }
  };

  const handleGoHome = async () => {
    if (isHost) {
      const confirmed = await useAlertStore.getState().showConfirm(
        "Si sales de la sala, esta se destruirá y todos los jugadores serán expulsados. ¿Estás seguro?",
        "Cerrar Sala"
      );
      if (!confirmed) return;
      destroyRoom();
    } else {
      useGameStore.getState().leaveRoom();
    }
    navigate('/');
  };

  const handleCancelJoin = () => {
    navigate('/');
  };

  if (isVerifying && !hasJoined) {
    return <Loader text="VERIFICANDO CONEXIÓN..." />;
  }

    if (!hasJoined) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--color-ink)] w-full animate-in zoom-in duration-300">
        <HomeButton onClick={handleCancelJoin} />

        <div className="w-full max-w-md flex flex-col items-center gap-4 sm:gap-6 bg-[var(--color-paper)] p-4 sm:p-6 md:p-8 border-4 border-[var(--color-ink)] rounded-3xl shadow-[6px_6px_0px_0px_var(--color-high-yellow)] sm:shadow-[8px_8px_0px_0px_var(--color-high-yellow)] text-center relative overflow-hidden">
          {/* Fondo sutil de cuadrícula para la tarjeta */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <Logo />
            
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mt-4 sm:mt-6 uppercase font-black text-[var(--color-ink)] tracking-wider">Entrar a Sala</h2>
            
            <div className="bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] w-full py-3 sm:py-4 mt-2 rounded-xl shadow-[4px_4px_0px_0px_var(--color-ink)] transform -rotate-1">
              <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.2em] text-[var(--color-ink)]">{code}</span>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col gap-3 sm:gap-4 w-full mt-4 sm:mt-6">
              <input 
                type="text"
                placeholder="Tu Nickname"
                required
                maxLength={15}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full border-4 border-[var(--color-ink)] bg-white p-3 sm:p-4 rounded-xl font-headline font-bold text-lg sm:text-2xl text-center text-[var(--color-ink)] focus:outline-none focus:ring-4 focus:ring-[var(--color-high-yellow)] placeholder:text-gray-400 shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,0.05)]"
              />
              <SoundButton 
                type="submit"
                clickSound="confirm"
                className="w-full py-3 sm:py-4 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] rounded-xl font-headline font-black text-xl sm:text-2xl text-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider"
              >
                ¡A Jugar!
              </SoundButton>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex-grow flex flex-col items-center relative p-4 sm:p-6 md:p-8 min-h-screen w-full animate-in fade-in duration-300 ${isHost || players.length > 1 ? 'pb-28 sm:pb-32' : 'pb-4 sm:pb-6'}`}>
      <div className="w-full max-w-5xl flex flex-col gap-3 sm:gap-5 md:gap-6">

        {/* Botón Home */}
        <HomeButton onClick={handleGoHome} />

        {/* Contador de jugadores flotante arriba a la derecha */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2 sm:gap-3 bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] px-3 sm:px-5 py-2 sm:py-3 rounded-2xl shadow-[4px_4px_0px_0px_var(--color-ink)]">
          <Users size={22} strokeWidth={2.5} className="sm:!w-6 sm:!h-6" />
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl sm:text-2xl md:text-3xl leading-none font-black">{players.length}</span>
            <span className="font-body font-bold text-[10px] sm:text-xs uppercase">Jugadores</span>
          </div>
        </div>

        {/* Codigo de Sala - protagonista */}
        <header className="flex flex-col items-center gap-2 sm:gap-3 bg-white border-4 border-[var(--color-ink)] rounded-3xl p-5 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_var(--color-ink)] sm:shadow-[8px_8px_0px_0px_var(--color-ink)] mt-10 sm:mt-0">
          <span className="font-body font-bold text-gray-500 uppercase tracking-widest text-xs sm:text-sm">Código de Sala</span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[0.15em] font-black text-[var(--color-ink)] py-1">{code}</h1>

          <RoleGuard 
            allowedRoles={['host']} 
            fallback={
              <p className="font-body text-gray-400 text-xs sm:text-sm text-center -mt-1">
                Esperando al Host...
              </p>
            }
          >
            <p className="font-body text-gray-400 text-xs sm:text-sm text-center -mt-1">
              Entra en <span className="font-bold text-gray-500">{window.location.origin}</span> y usa este código
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <SoundButton 
                clickSound="click"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border-3 border-[var(--color-ink)] rounded-xl hover:bg-[var(--color-paper-dim)] transition-all font-headline font-bold text-sm sm:text-base"
                style={{ borderWidth: '3px' }}
                title="Copiar Enlace"
              >
                {copied ? <Check size={20} className="text-green-600 sm:!w-5 sm:!h-5" /> : <Copy size={20} className="sm:!w-5 sm:!h-5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
              </SoundButton>
              <SoundButton
                clickSound="click"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all font-headline font-bold text-sm sm:text-base"
                style={{ borderWidth: '3px', borderColor: 'var(--color-ink)' }}
                title="Compartir por WhatsApp"
              >
                <Share2 size={20} className="sm:!w-5 sm:!h-5" />
                <span>WhatsApp</span>
              </SoundButton>
            </div>
          </RoleGuard>
        </header>

        {/* Notificador de Categoría Actual (Visible para todos) */}
        <div className="text-center">
          <span className="font-headline font-bold text-[var(--color-ink)] uppercase tracking-widest text-sm sm:text-lg bg-[var(--color-paper)] px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-high-yellow)] inline-flex flex-wrap items-center gap-1 sm:gap-2 justify-center">
            <span>Tema:</span> <span className="text-[var(--color-ink)] bg-[var(--color-high-pink)] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_0px_var(--color-ink)]">{categoryName || 'Trivia'}</span>
          </span>
        </div>

        {/* Lista de Jugadores */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-4 place-items-center">
          {players.map((p) => {
            const isMe = p.deviceId === localStorage.getItem('quizsync_device_id');
            return (
              <PlayerCard 
                key={p.deviceId} 
                player={p} 
                emotes={activeEmotes.filter(e => e.targetId === p.deviceId).map(e => ({ id: e.id, payload: e.payload }))}
                isPoked={activePokes.includes(p.deviceId)}
                onPoke={() => handlePoke(p.deviceId)}
                isMe={isMe}
                onChangeAvatar={handleChangeAvatar}
                onTransferHost={() => handleTransferHost(p.deviceId)}
                onKick={() => handleKickPlayer(p.deviceId)}
                onBan={() => handleBan(p.deviceId)}
                onMuteEmotes={() => useGameStore.getState().toggleMuteEmotes(p.deviceId)}
              />
            );
          })}
          {players.length === 0 && (
            <p className="col-span-full text-center font-body text-lg sm:text-xl font-bold text-gray-500 mt-4 sm:mt-8">
              Nadie se ha unido todavía...
            </p>
          )}
        </section>

        {/* Barra inferior fija - Host ve controles, jugadores ven emojis */}
        <RoleGuard 
          allowedRoles={['host']}
          fallback={
            players.length > 1 ? (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-4 bg-white border-4 border-[var(--color-ink)] p-2 sm:p-3 px-3 sm:px-6 rounded-full shadow-[4px_4px_0px_0px_var(--color-ink)] sm:shadow-[6px_6px_0px_0px_var(--color-ink)] max-w-[95vw] overflow-x-auto">
                {AVAILABLE_EMOTES.map(emoji => (
                  <SoundButton
                    key={emoji}
                    clickSound="click"
                    hoverSound="none"
                    onClick={() => handleEmote(emoji)}
                    className="text-2xl sm:text-3xl hover:scale-125 transition-transform active:scale-95 flex-shrink-0"
                  >
                    {emoji}
                  </SoundButton>
                ))}
              </div>
            ) : null
          }
        >
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 bg-white border-4 border-[var(--color-ink)] p-2 sm:p-3 rounded-2xl shadow-[6px_6px_0px_0px_var(--color-ink)] max-w-[95vw]">
            <div className="relative flex-shrink-0">
              <select 
                onChange={handleCategoryChange}
                defaultValue=""
                className="appearance-none bg-[var(--color-paper-dim)] border-3 border-[var(--color-ink)] rounded-xl py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-9 font-headline font-bold text-sm sm:text-base hover:bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-high-pink)] transition-all cursor-pointer"
                style={{ borderWidth: '3px' }}
              >
                <option value="" disabled>Cambiar Tema</option>
                <option value="random">🎲 Aleatorio</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-[var(--color-ink)]">
                <Edit3 size={16} strokeWidth={3} className="sm:!w-[18px] sm:!h-[18px]" />
              </div>
            </div>

            <SoundButton 
              clickSound="confirm"
              onClick={handleStartGame}
              disabled={players.filter(p => p.connected).length < 2 || isStarting}
              className={`flex items-center gap-2 py-2 sm:py-2.5 px-4 sm:px-6 border-3 rounded-xl font-display text-base sm:text-xl transition-all uppercase whitespace-nowrap flex-shrink-0 ${
                players.filter(p => p.connected).length < 2 || isStarting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400' 
                  : 'bg-[var(--color-high-yellow)] text-[var(--color-ink)] border-[var(--color-ink)] shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)]'
              }`}
              style={{ borderWidth: '3px' }}
            >
              <Play size={18} fill="currentColor" className="sm:!w-5 sm:!h-5" /> {isStarting ? 'Iniciando...' : 'Iniciar'}
            </SoundButton>
          </div>
        </RoleGuard>

      </div>
    </main>
  );
}
