import { Eye, Globe2, Home, Lock, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "@/shared/api/apiClient";
import { engineClient } from "@/shared/api/engineClient";

type Visibility = "PUBLIC" | "PRIVATE";
type GameMode = "NORMAL" | "POWER_MODE";
type Role = "PLAYER" | "SPECTATOR";

export function CreateGamePage() {
  const navigate = useNavigate();
  
  // Form State
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [gameMode, setGameMode] = useState<GameMode>("NORMAL");
  const [role, setRole] = useState<Role>("PLAYER");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("random");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  


  useEffect(() => {
    apiClient.get("/quizzes/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  const handleCreate = async (force: boolean = false) => {
    try {
      let deviceId = localStorage.getItem('quizsync_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('quizsync_device_id', deviceId);
      }

      // Petición al game-engine para crear la sala en memoria usando el cliente modular
      const response = await engineClient.post("/rooms", {
        categoryId: selectedCategoryId,
        gameMode,
        visibility,
        hostId: deviceId,
        force
      });
      
      const realCode = response.data.roomId;
      
      // Redirigir directamente al lobby en vez de mostrar pantalla intermedia
      navigate(`/lobby/${realCode}`);
    } catch (error: any) {
      const { useAlertStore } = await import('@/shared/store/useAlertStore');
      
      if (error.response?.status === 409 && error.response?.data?.errorCode === 'ROOM_ALREADY_EXISTS') {
        const confirmed = await useAlertStore.getState().showConfirm(
          "Ya tienes una sala activa en el servidor. Si continúas, la otra sala será destruida automáticamente. ¿Deseas continuar?", 
          "Sala Previa Detectada"
        );
        if (confirmed) {
          return handleCreate(true);
        }
        return;
      }

      console.error("Error al crear la sala:", error);
      useAlertStore.getState().showAlert("No se pudo crear la sala. Verifica tu conexión o intenta con otra categoría.", "Error");
    }
  };



  return (
    <main className="flex-grow flex flex-col items-center justify-center relative px-4 sm:px-8 py-12 min-h-screen z-10 w-full animate-in fade-in duration-300">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-display font-bold uppercase text-black"
      >
        <Home size={24} strokeWidth={2.5} />
        <span className="hidden sm:inline">Inicio</span>
      </button>

      <div className="w-full max-w-lg lg:max-w-4xl flex flex-col gap-8 bg-white/90 backdrop-blur-md p-6 sm:p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-display text-4xl lg:text-5xl text-center uppercase tracking-wide">Configurar Partida</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Columna Izquierda: Configuraciones Básicas */}
          <div className="flex flex-col gap-6">
            {/* Visibilidad */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Visibilidad</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setVisibility("PRIVATE")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${visibility === "PRIVATE" ? "bg-[#3730A3] border-[#3730A3] text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <Lock size={20} strokeWidth={2.5} /> Privada
                </button>
                <button 
                  onClick={() => setVisibility("PUBLIC")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${visibility === "PUBLIC" ? "bg-[#3730A3] border-[#3730A3] text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <Globe2 size={20} strokeWidth={2.5} /> Pública
                </button>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                {visibility === "PUBLIC" ? "Cualquiera podrá unirse desde el explorador." : "Solo podrán unirse con tu código."}
              </p>
            </div>

            {/* Modo de Juego */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Modo de Juego</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setGameMode("NORMAL")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${gameMode === "NORMAL" ? "bg-[var(--color-high-yellow)] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  Normal
                </button>
                <button 
                  disabled
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`}
                  title="Próximamente"
                >
                  <Zap size={20} strokeWidth={2.5} fill="currentColor" /> Poderes
                </button>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                El modo Poderes estará disponible próximamente.
              </p>
            </div>

            {/* Tu Rol */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Tu Participación</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setRole("PLAYER")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${role === "PLAYER" ? "bg-black border-black text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <User size={20} strokeWidth={2.5} /> Jugador
                </button>
                <button 
                  disabled
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`}
                  title="Próximamente"
                >
                  <Eye size={20} strokeWidth={2.5} /> Espectador
                </button>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                {role === "SPECTATOR" ? "El modo espectador (pantalla gigante) estará disponible pronto." : "Competirás y responderás preguntas con tu Avatar."}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Tema y Acción */}
          <div className="flex flex-col gap-6 justify-between lg:border-l-4 lg:border-dashed lg:border-gray-200 lg:pl-12 pt-6 lg:pt-0 border-t-4 border-dashed border-gray-200 lg:border-t-0">
            
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Tema del Cuestionario</label>
              <div className="relative">
                <select 
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full appearance-none bg-white border-4 border-black rounded-xl py-3 px-4 font-body font-bold text-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-[#E0E7FF] transition-all cursor-pointer"
                >
                  <option value="random">🎲 Aleatorio / Sorpréndeme</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
                  <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                En partidas públicas, este será el nombre de la sala.
              </p>
            </div>

            <div className="flex-grow hidden lg:flex items-center justify-center opacity-20">
              <Zap size={120} />
            </div>

            <button 
              onClick={() => handleCreate(false)}
              className="w-full py-4 bg-[var(--color-high-yellow)] border-4 border-black rounded-xl font-display text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wide mt-auto"
            >
              Crear Sala
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
