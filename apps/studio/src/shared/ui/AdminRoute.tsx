import { useUser, useClerk } from "@clerk/clerk-react";
import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center font-headline text-2xl font-bold animate-pulse">Cargando identidad...</div>;
  }

  // Verificamos si en la metadata pública de Clerk se le asignó el rol admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="bg-[var(--color-high-pink)] border-4 border-[var(--color-ink)] p-6 rounded-2xl shadow-[8px_8px_0px_0px_var(--color-ink)] transform -rotate-2">
          <ShieldAlert size={64} className="mx-auto mb-4" />
          <h1 className="font-headline font-black text-4xl uppercase">Acceso Denegado</h1>
        </div>
        <p className="font-body text-xl font-bold max-w-md">
          Tu cuenta no tiene privilegios de Administrador para acceder a QuizSync Studio.
        </p>
        <button 
          onClick={() => signOut()}
          className="bg-white border-2 border-[var(--color-ink)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-paper-dim)] transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
