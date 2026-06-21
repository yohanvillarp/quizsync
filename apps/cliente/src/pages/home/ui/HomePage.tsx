import { CreateGameButton } from "@/features/create-game/ui/CreateGameButton";
import { JoinGameForm } from "@/features/join-game/ui/JoinGameForm";
import { BrowseGamesButton } from "@/features/browse-public-games/ui/BrowseGamesButton";
import { PublicGamesModal } from "@/features/browse-public-games/ui/PublicGamesModal";
import { Logo } from "@/shared/ui/Logo";
import { Backpack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveAvatarWidget } from "@/widgets/active-avatar/ui/ActiveAvatarWidget";
import { AudioVisualizerWidget } from "@/widgets/audio-background/ui/AudioVisualizerWidget";
import { useEffect, useState } from "react";
import { getRandomHomeQuote } from "@/entities/quote/api/getRandomHomeQuote";

export function HomePage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState("Cargando...");
  const [isPublicGamesOpen, setIsPublicGamesOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getRandomHomeQuote().then(q => {
      if (mounted) setQuote(q);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pb-20 sm:pb-24 overflow-y-auto z-10 w-full">
      <AudioVisualizerWidget />

      {/* Botón de Inventario (Esquina superior izquierda) */}
      <button 
        onClick={() => navigate('/inventory')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-full border-[3px] border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink-offset)] sm:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink-offset)] sm:hover:shadow-[8px_8px_0px_0px_var(--color-ink-offset)] hover:bg-[var(--color-high-yellow)] transition-all font-bold text-base sm:text-lg"
      >
        <Backpack size={20} strokeWidth={2.5} className="sm:!w-6 sm:!h-6" />
        <span className="hidden sm:inline">Inventario</span>
      </button>
      
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

        {/* Quick Info / Subtext */}
        <p className="font-body text-base sm:text-lg text-gray-500 italic mt-3 sm:mt-4 font-bold text-center px-4 max-w-md">
          "{quote}"
        </p>
      </div>

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
    </main>
  );
}
