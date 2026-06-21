import { Logo } from "@/shared/ui/Logo";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ text = "Cargando...", fullScreen = true }: LoaderProps) {
  const containerClasses = fullScreen 
    ? "flex-grow flex flex-col items-center justify-center p-8 min-h-screen bg-[var(--color-ink)] w-full fixed inset-0 z-50"
    : "flex flex-col items-center justify-center p-8 w-full";

  return (
    <main className={containerClasses}>
      <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
        
        {/* Usamos el Logo con una animación de rebote y temblor */}
        <div className="animate-bounce">
          <div className="animate-live-paper">
            <Logo />
          </div>
        </div>

        {/* Texto brutalista */}
        <div className="bg-[var(--color-paper)] border-4 border-white px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_white] transform rotate-1">
          <span className="font-headline font-black text-xl md:text-2xl tracking-[0.2em] text-[var(--color-ink)] uppercase animate-pulse">
            {text}
          </span>
        </div>

      </div>
    </main>
  );
}
