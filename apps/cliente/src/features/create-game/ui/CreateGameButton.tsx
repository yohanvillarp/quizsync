import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { SoundButton } from "@/shared/ui/SoundButton";

export function CreateGameButton() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/create");
  };

  return (
    <SoundButton
      clickSound="click"
      onClick={handleCreate}
      className="group w-full py-3 sm:py-4 bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 font-headline text-sm sm:text-lg md:text-xl font-black text-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wide leading-tight"
      title="Crear una nueva partida"
    >
      <div className="bg-[var(--color-ink)] rounded-full p-1 group-hover:rotate-90 transition-transform flex-shrink-0">
        <Plus size={14} strokeWidth={3} className="text-[var(--color-high-pink)] sm:!w-4 sm:!h-4" />
      </div>
      <span>Crear Partida</span>
    </SoundButton>
  );
}
