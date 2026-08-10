import { Routes, Route } from 'react-router-dom';
import { Navbar } from '../widgets/Navbar/ui/Navbar';
import { HomePage } from '../pages/Home/ui/HomePage';
import { ReportsPage } from '../pages/Reports/ui/ReportsPage';
import { NotFoundPage } from '../pages/NotFound/ui/NotFoundPage';
import { Activity } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-brand-white text-brand-black font-sans">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/stress" element={
            <div className="min-h-[calc(100vh-80px)] w-full flex flex-col p-8 max-w-7xl mx-auto">
              <div className="mb-10 border-b-4 border-brand-black pb-6">
                <p className="text-sm font-bold tracking-widest uppercase mb-2">PROYECTO AUDITADO</p>
                <div className="flex items-center gap-4">
                  <Activity className="w-12 h-12 text-brand-black" strokeWidth={3} />
                  <h1 className="text-5xl font-black uppercase tracking-tight">STRESS TEST</h1>
                </div>
                <div className="mt-6 bg-brand-black text-brand-white inline-block px-4 py-2 font-bold uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(231,76,60,1)]">
                  Veredicto: Rendimiento de WebSockets bajo alta carga.
                </div>
              </div>
              <div className="flex-1 brutalist-card flex flex-col p-1">
                <iframe 
                src="/stress-raw/index.html" 
                title="Socket.IO Stress Report"
                className="w-full h-[800px] border-none"
              ></iframe>
              </div>
            </div>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
