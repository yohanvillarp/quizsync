import { Routes, Route } from 'react-router-dom';
import { Navbar } from '../widgets/Navbar/ui/Navbar';
import { HomePage } from '../pages/Home/ui/HomePage';
import { ReportsPage } from '../pages/Reports/ui/ReportsPage';
import { NotFoundPage } from '../pages/NotFound/ui/NotFoundPage';
import { Activity } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-azure-bg text-azure-text font-sans">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          {/* Aquí irá la página de stress próximamente */}
          <Route path="/stress" element={
            <div className="h-[calc(100vh-64px)] w-full flex flex-col p-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="mb-6 flex items-center gap-3">
                <Activity className="w-10 h-10 text-azure-blue" />
                <div>
                  <h1 className="text-3xl font-bold text-azure-text mb-1">Pruebas de Estrés (Artillery)</h1>
                  <p className="text-azure-text-sec">
                    Métricas de rendimiento y websockets del Game Engine bajo alta carga.
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-azure-surface border border-azure-border rounded-lg shadow-sm overflow-hidden flex flex-col">
                <iframe 
                src="/stress-raw/index.html" 
                title="Artillery Stress Report"
                className="w-full h-full border-none flex-1"
              ></iframe>
              </div>
            </div>
          } />
          {/* Ruta por defecto (404) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
