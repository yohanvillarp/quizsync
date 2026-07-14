import { Eye, Globe2, Home, Lock, User, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SoundButton } from "@/shared/ui/SoundButton";

import { apiClient } from "@/shared/api/apiClient";
import { engineClient } from "@/shared/api/engineClient";
import { useGameStore } from "@/entities/game/model/useGameStore";
import type { GameModeId } from "@/entities/game/model/game-mode.types";
import { GameModeSelector } from "@/features/create-game/ui/GameModeSelector";

type Visibility = "PUBLIC" | "PRIVATE";
type Role = "PLAYER" | "SPECTATOR";

export function CreateGamePage() {
  const navigate = useNavigate();
  
  // Form State
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [gameModeId, setGameModeId] = useState<GameModeId>("NORMAL");
  const [role, setRole] = useState<Role>("PLAYER");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("random");
  const [selectedQuizId, setSelectedQuizId] = useState<string>("random");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [quizzes, setQuizzes] = useState<{ id: string; title: string; description: string; questions: any[] }[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    useGameStore.getState().clearGameState();
    
    apiClient.get("/quizzes/categories?hasQuestions=true")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  useEffect(() => {
    if (selectedCategoryId === "random") {
      setQuizzes([]);
      setSelectedQuizId("random");
      return;
    }

    apiClient.get(`/quizzes?categoryId=${selectedCategoryId}`)
      .then(res => {
        setQuizzes(res.data);
        setSelectedQuizId("random");
      })
      .catch(err => console.error("Error cargando quizzes:", err));
  }, [selectedCategoryId]);

  // Calculate max available questions
  const maxAvailableQuestions = useMemo(() => {
    if (selectedCategoryId === "random") return 50;
    if (selectedQuizId !== "random") {
      const quiz = quizzes.find(q => q.id === selectedQuizId);
      return quiz ? quiz.questions.length : 10;
    }
    // Mix category
    return quizzes.reduce((acc, q) => acc + q.questions.length, 0) || 10;
  }, [selectedCategoryId, selectedQuizId, quizzes]);

  // Ensure questionCount respects the new max
  useEffect(() => {
    if (questionCount > maxAvailableQuestions) {
      setQuestionCount(maxAvailableQuestions);
    }
  }, [maxAvailableQuestions]);

  const handleCreate = async (force: boolean = false) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      let deviceId = localStorage.getItem('quizsync_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('quizsync_device_id', deviceId);
      }

      // Petición al game-engine para crear la sala en memoria usando el cliente modular
      const response = await engineClient.post("/rooms", {
        categoryId: selectedCategoryId,
        quizId: selectedQuizId,
        gameModeId,
        visibility,
        hostId: deviceId,
        maxPlayers,
        questionCount,
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
      useAlertStore.getState().showAlert(error.response?.data?.message || "No se pudo crear la sala. Verifica tu conexión o intenta con otra categoría.", "Error");
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <main className="flex-grow flex flex-col items-center justify-center relative px-4 sm:px-8 py-12 min-h-screen z-10 w-full animate-in fade-in duration-300">
      <SoundButton 
        clickSound="click"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-display font-bold uppercase text-black"
      >
        <Home size={24} strokeWidth={2.5} />
        <span className="hidden sm:inline">Inicio</span>
      </SoundButton>

      <div className="w-full max-w-lg lg:max-w-4xl flex flex-col gap-8 bg-white/90 backdrop-blur-md p-6 sm:p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-display text-4xl lg:text-5xl text-center uppercase tracking-wide">Crear Partida</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Columna Izquierda: Configuraciones Básicas */}
          <div className="flex flex-col gap-6">
            {/* Visibilidad */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Visibilidad</label>
              <div className="grid grid-cols-2 gap-3">
                <SoundButton 
                  clickSound="click"
                  onClick={() => setVisibility("PRIVATE")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${visibility === "PRIVATE" ? "bg-[#3730A3] border-[#3730A3] text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <Lock size={20} strokeWidth={2.5} /> Privada
                </SoundButton>
                <SoundButton 
                  clickSound="click"
                  onClick={() => setVisibility("PUBLIC")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${visibility === "PUBLIC" ? "bg-[#3730A3] border-[#3730A3] text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <Globe2 size={20} strokeWidth={2.5} /> Pública
                </SoundButton>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                {visibility === "PUBLIC" ? "Cualquiera podrá unirse desde el explorador." : "Solo podrán unirse con tu código."}
              </p>
            </div>

            <GameModeSelector value={gameModeId} onChange={setGameModeId} />

            {/* Tu Rol */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xl">Tu Participación</label>
              <div className="grid grid-cols-2 gap-3">
                <SoundButton 
                  clickSound="click"
                  onClick={() => setRole("PLAYER")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold ${role === "PLAYER" ? "bg-black border-black text-white" : "bg-white border-gray-300 text-gray-500 hover:border-black"}`}
                >
                  <User size={20} strokeWidth={2.5} /> Jugador
                </SoundButton>
                <SoundButton 
                  clickSound="error"
                  disabled
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-4 transition-all font-bold bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`}
                  title="Próximamente"
                >
                  <Eye size={20} strokeWidth={2.5} /> Espectador
                </SoundButton>
              </div>
              <p className="text-sm font-body font-bold text-gray-500">
                {role === "SPECTATOR" ? "El modo espectador (pantalla gigante) estará disponible pronto." : "Competirás y responderás preguntas con tu Avatar."}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Configuraciones Avanzadas y Tema */}
          <div className="flex flex-col gap-6 justify-between lg:border-l-4 lg:border-dashed lg:border-gray-200 lg:pl-12 pt-6 lg:pt-0 border-t-4 border-dashed border-gray-200 lg:border-t-0">

            {/* Botón de Configuraciones Avanzadas */}
            <SoundButton
              clickSound="click"
              hoverSound="hover"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-all text-gray-600 font-display text-lg"
            >
              <div className="flex items-center gap-2">
                <Settings size={20} />
                <span>Configuraciones Avanzadas</span>
              </div>
              {showAdvancedSettings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </SoundButton>

            {/* Configuraciones Dinámicas (Colapsables) */}
            {showAdvancedSettings && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 p-4 border-2 border-gray-200 rounded-xl bg-gray-50/50">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-display text-lg">Límite de Jugadores</label>
                    <span className="font-body font-bold text-lg bg-white px-3 py-1 rounded-lg border-2 border-gray-200">{maxPlayers}</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="20" 
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-display text-lg">Número de Preguntas</label>
                    <span className="font-body font-bold text-lg bg-white px-3 py-1 rounded-lg border-2 border-gray-200">{questionCount}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max={maxAvailableQuestions} 
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                  <p className="text-xs font-body font-bold text-gray-500">
                    Máximo disponible según tu selección: {maxAvailableQuestions}
                  </p>
                </div>
              </div>
            )}
            
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

            {/* Cuestionario Específico (Solo visible si hay una categoría seleccionada) */}
            {selectedCategoryId !== "random" && quizzes.length > 0 && (
              <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                <label className="font-display text-lg text-gray-600">Cuestionario Específico (Opcional)</label>
                <div className="relative">
                  <select 
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-dashed border-gray-400 rounded-xl py-3 px-4 font-body font-medium text-md hover:bg-gray-50 focus:outline-none focus:border-black focus:ring-2 focus:ring-black transition-all cursor-pointer truncate"
                  >
                    <option value="random">🎲 Mezclar todos los de esta categoría</option>
                    {quizzes.map(quiz => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}



            <SoundButton 
              clickSound="confirm"
              onClick={() => handleCreate(false)}
              disabled={isCreating}
              className={`w-full py-4 border-4 border-black rounded-xl font-display text-2xl uppercase tracking-wide mt-auto flex items-center justify-center gap-2 transition-all ${
                isCreating 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-[var(--color-high-yellow)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-6 h-6 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                "Crear Sala"
              )}
            </SoundButton>
          </div>
        </div>
      </div>
    </main>
  );
}
