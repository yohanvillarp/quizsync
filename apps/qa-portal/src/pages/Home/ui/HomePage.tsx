import { ShieldCheck, MonitorCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 flex flex-col items-center">
        <ShieldCheck className="w-16 h-16 text-azure-blue mb-4" />
        <h1 className="text-4xl font-extrabold text-azure-text mb-4 tracking-tight">
          Portal de QA
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-azure-surface border border-azure-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <MonitorCheck className="w-6 h-6 text-azure-blue" />
            <h2 className="text-xl font-bold text-azure-blue">Pruebas End-to-End (Playwright)</h2>
          </div>
          <p className="text-azure-text-sec mb-4">
            Revisa los resultados detallados de los flujos automáticos sobre la interfaz gráfica y funcionalidades principales.
          </p>
          <Link to="/reports" className="text-azure-blue font-semibold hover:underline">
            Ver Reportes E2E &rarr;
          </Link>
        </div>
        
        <div className="bg-azure-surface border border-azure-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-6 h-6 text-azure-blue" />
            <h2 className="text-xl font-bold text-azure-blue">Pruebas de Estrés (Artillery)</h2>
          </div>
          <p className="text-azure-text-sec mb-4">
            Monitorea el rendimiento del Game Engine y la capacidad de los websockets bajo carga masiva de usuarios.
          </p>
          <Link to="/stress" className="text-azure-blue font-semibold hover:underline">
            Ver Métricas de Red &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
