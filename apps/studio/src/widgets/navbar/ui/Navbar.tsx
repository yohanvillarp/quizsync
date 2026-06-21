import { Link } from "react-router-dom";
import { PenTool, Library, Settings, LayoutDashboard } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full bg-[var(--color-high-yellow)] border-b-4 border-[var(--color-ink)] px-6 py-4 flex items-center justify-between shadow-[0px_4px_0px_0px_var(--color-ink)] z-50 sticky top-0">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="bg-white border-2 border-[var(--color-ink)] p-2 rounded-lg transform -rotate-3 shadow-[2px_2px_0px_0px_var(--color-ink)]">
          <PenTool size={24} className="text-[var(--color-ink)]" />
        </div>
        <h1 className="font-headline font-bold text-2xl tracking-tighter uppercase">QuizSync Studio</h1>
      </Link>

      <div className="flex items-center gap-6 font-headline font-bold text-lg">
        <Link to="/" className="flex items-center gap-2 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-2 rounded-xl transition-all border-2 border-transparent">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/quizzes" className="flex items-center gap-2 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-2 rounded-xl transition-all border-2 border-transparent">
          <Library size={20} />
          Mis Quizzes
        </Link>
        <button className="flex items-center gap-2 bg-white border-2 border-[var(--color-ink)] px-4 py-2 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
          <Settings size={20} />
          Configuración
        </button>
      </div>
    </nav>
  );
}
