import { CreateGameButton } from "@/features/create-game/ui/CreateGameButton";
import { JoinGameForm } from "@/features/join-game/ui/JoinGameForm";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";
import { Logo } from "@/shared/ui/Logo";
import { Backpack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveAvatarWidget } from "@/widgets/active-avatar/ui/ActiveAvatarWidget";
import { useEffect, useState } from "react";
import { getRandomHomeQuote } from "@/entities/quote/api/getRandomHomeQuote";

export function HomePage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState("Cargando...");

  useEffect(() => {
    let mounted = true;
    getRandomHomeQuote().then(q => {
      if (mounted) setQuote(q);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-center relative px-8 py-12 overflow-hidden min-h-screen z-10 w-full">
      {/* Background Visualizer */}
      <AudioVisualizerWidget />

      {/* Botón de Inventario (Esquina superior izquierda) */}
      <button 
        onClick={() => navigate('/inventory')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-ink-offset)] hover:bg-[var(--color-high-yellow)] transition-all font-bold text-lg"
      >
        <Backpack size={24} strokeWidth={2.5} />
        <span className="hidden sm:inline">Inventario</span>
      </button>
      
      {/* Central Action Area */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 z-10 md:max-w-2xl">
        {/* Hand-drawn Title */}
        <div className="text-center mb-8">
          <Logo />
        </div>

        {/* Feature: Join Game */}
        <JoinGameForm />

        {/* Feature: Create Game */}
        <div className="w-full mt-2">
          <CreateGameButton />
        </div>

        {/* Quick Info / Subtext */}
        <p className="font-body text-lg text-gray-500 italic mt-6 font-bold text-center">
          "{quote}"
        </p>
      </div>

      {/* Active Avatar Buddy */}
      <ActiveAvatarWidget />
    </main>
  );
}
