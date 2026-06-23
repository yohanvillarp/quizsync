import { Link, NavLink } from "react-router-dom";
import { PenTool, Library, Settings, LayoutDashboard, Menu, X } from "lucide-react";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { useState } from "react";

export function Navbar() {
  const { showAlert } = useAlertStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFutureFeatureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    showAlert("Esta funcionalidad se implementará en futuras actualizaciones.", "¡Próximamente!");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getDesktopNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 ${
      isActive 
        ? "bg-white border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] translate-x-[-2px] translate-y-[-2px]" 
        : "border-transparent hover:bg-white hover:border-[var(--color-ink)]"
    }`;

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 ${
      isActive 
        ? "bg-white border-[var(--color-ink)] shadow-[4px_4px_0px_0px_var(--color-ink)] translate-x-[-2px] translate-y-[-2px]" 
        : "border-transparent hover:bg-white hover:border-[var(--color-ink)]"
    }`;

  return (
    <nav className="w-full bg-[var(--color-high-yellow)] border-b-4 border-[var(--color-ink)] px-4 md:px-6 py-4 shadow-[0px_4px_0px_0px_var(--color-ink)] z-50 sticky top-0">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-white border-2 border-[var(--color-ink)] p-2 rounded-lg transform -rotate-3 shadow-[2px_2px_0px_0px_var(--color-ink)]">
            <PenTool size={24} className="text-[var(--color-ink)]" />
          </div>
          <h1 className="font-headline font-bold text-xl md:text-2xl tracking-tighter uppercase">QuizSync Studio</h1>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden bg-white border-2 border-[var(--color-ink)] p-2 rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          {isMenuOpen ? <X size={24} className="text-[var(--color-ink)]" /> : <Menu size={24} className="text-[var(--color-ink)]" />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-headline font-bold text-lg">
          <NavLink to="/" className={getDesktopNavLinkClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/categories" className={getDesktopNavLinkClass}>
            <Library size={20} />
            Categorías
          </NavLink>
          <a href="#" onClick={handleFutureFeatureClick} className="flex items-center gap-2 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-2 rounded-xl transition-all border-2 border-transparent">
            <Library size={20} />
            Mis Quizzes
          </a>
          <button onClick={handleFutureFeatureClick} className="flex items-center gap-2 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-2 rounded-xl transition-all border-2 border-transparent">
            <Settings size={20} />
            Configuración
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t-2 border-dashed border-[var(--color-ink)] flex flex-col gap-4 font-headline font-bold text-lg animate-in slide-in-from-top-2">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={getMobileNavLinkClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/categories" onClick={() => setIsMenuOpen(false)} className={getMobileNavLinkClass}>
            <Library size={20} />
            Categorías
          </NavLink>
          <a href="#" onClick={handleFutureFeatureClick} className="flex items-center gap-3 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-3 rounded-xl transition-all border-2 border-transparent">
            <Library size={20} />
            Mis Quizzes
          </a>
          <button onClick={handleFutureFeatureClick} className="flex items-center gap-3 hover:bg-white hover:border-2 hover:border-[var(--color-ink)] px-4 py-3 rounded-xl transition-all border-2 border-transparent text-left">
            <Settings size={20} />
            Configuración
          </button>
        </div>
      )}
    </nav>
  );
}
