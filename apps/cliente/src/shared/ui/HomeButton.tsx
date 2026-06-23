import { Home } from "lucide-react";
import { SoundButton } from "./SoundButton";

interface HomeButtonProps {
  onClick: () => void;
  title?: string;
}

export function HomeButton({ onClick, title = "Volver al inicio" }: HomeButtonProps) {
  return (
    <SoundButton 
      onClick={onClick}
      className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 sm:z-50 flex items-center gap-2 bg-white border-4 border-[var(--color-ink)] rounded-xl px-3 py-2.5 shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-headline font-bold text-sm sm:text-base"
      title={title}
      clickSound="click"
      hoverSound="hover"
    >
      <Home size={22} strokeWidth={2.5} className="sm:!w-6 sm:!h-6" />
      <span>Inicio</span>
    </SoundButton>
  );
}
