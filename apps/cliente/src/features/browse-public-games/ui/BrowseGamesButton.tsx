import { Globe } from "lucide-react";

interface BrowseGamesButtonProps {
  onClick: () => void;
}

export function BrowseGamesButton({ onClick }: BrowseGamesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 sm:gap-2 w-full py-3 sm:py-4 rounded-xl font-headline text-sm sm:text-lg md:text-xl font-black text-[var(--color-ink)] bg-[var(--color-paper-dim)] border-4 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wide text-center leading-tight"
      title="Encontrar partidas públicas"
    >
      <Globe size={18} strokeWidth={2.5} className="sm:!w-5 sm:!h-5 flex-shrink-0" />
      <span>Encontrar Partidas</span>
    </button>
  );
}
