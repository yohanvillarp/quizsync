import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="w-24 h-24 text-azure-blue mx-auto mb-6" />
        <h1 className="text-6xl font-extrabold text-azure-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-azure-text-sec mb-6">Página no encontrada</h2>
        <p className="text-azure-text-sec mb-8 max-w-md mx-auto">
          Lo sentimos, pero la página o el reporte que estás buscando no existe o fue movido.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-azure-blue hover:bg-azure-hover text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
