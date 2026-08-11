import { ShieldCheck, MonitorCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 flex flex-col items-center">
        <ShieldCheck className="w-20 h-20 text-brand-black mb-6" strokeWidth={2.5} />
        <h1 className="text-5xl md:text-7xl font-black text-brand-black mb-4 tracking-tighter uppercase">
          Portal de QA
        </h1>
        <div className="h-2 w-32 bg-brand-black mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        <Link to="/reports" className="brutalist-card p-8 flex flex-col group cursor-pointer text-brand-black no-underline">
          <div className="flex items-center gap-4 mb-6">
            <MonitorCheck className="w-8 h-8 text-brand-black" strokeWidth={2.5} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Pruebas E2E</h2>
          </div>
          <p className="font-sans font-medium mb-8 flex-1 text-brand-black">
            Revisa los resultados detallados de los flujos automáticos sobre la interfaz gráfica y funcionalidades principales.
          </p>
          <div className="font-bold uppercase tracking-wider text-sm mt-auto group-hover:underline">
            Ver Reportes &rarr;
          </div>
        </Link>
        
        <Link to="/stress" className="brutalist-card p-8 flex flex-col group cursor-pointer text-brand-black no-underline">
          <div className="flex items-center gap-4 mb-6">
            <Activity className="w-8 h-8 text-brand-black" strokeWidth={2.5} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Stress Test</h2>
          </div>
          <p className="font-sans font-medium mb-8 flex-1 text-brand-black">
            Monitorea el rendimiento del Game Engine y la capacidad de los websockets bajo carga masiva de usuarios.
          </p>
          <div className="font-bold uppercase tracking-wider text-sm mt-auto group-hover:underline">
            Métricas de Red &rarr;
          </div>
        </Link>
        
        <Link to="/audit" className="brutalist-card p-8 flex flex-col group cursor-pointer text-brand-black no-underline">
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-black" strokeWidth={2.5} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Gemcheck</h2>
          </div>
          <p className="font-sans font-medium mb-8 flex-1 text-brand-black">
            Explora las métricas de calidad de código, complejidad ciclomática, duplicación y deuda técnica del monorepo.
          </p>
          <div className="font-bold uppercase tracking-wider text-sm mt-auto group-hover:underline">
            Auditoría QA &rarr;
          </div>
        </Link>
        
        <a href="/bdd-raw/index.html" className="brutalist-card p-8 flex flex-col group cursor-pointer text-brand-black no-underline">
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-black" strokeWidth={2.5} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Pruebas BDD</h2>
          </div>
          <p className="font-sans font-medium mb-8 flex-1 text-brand-black">
            Revisa los reportes de pruebas de aceptación y comportamiento (BDD) escritos en lenguaje natural (Gherkin).
          </p>
          <div className="font-bold uppercase tracking-wider text-sm mt-auto group-hover:underline">
            Ver Casos de Uso &rarr;
          </div>
        </a>
      </div>
    </div>
  );
}
