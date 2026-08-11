import { useEffect, useState } from 'react';
import { ComplexityDashboard, GitDashboard, ScanDashboard } from '@nikelyh/gemcheck-dashboard';
import '@nikelyh/gemcheck-dashboard/style.css'; 

export function GemcheckPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'complexity' | 'git'>('scan');
  
  const [scanData, setScanData] = useState(null);
  const [complexityData, setComplexityData] = useState(null);
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        // Intentamos cargar los 3 reportes
        const [scanRes, compRes, gitRes] = await Promise.allSettled([
          fetch('/gemcheck/gemcheck-report.json').then(r => r.ok ? r.json() : null),
          fetch('/gemcheck/complexity-report.json').then(r => r.ok ? r.json() : null),
          fetch('/gemcheck/git-activity.json').then(r => r.ok ? r.json() : null)
        ]);

        if (scanRes.status === 'fulfilled') setScanData(scanRes.value);
        if (compRes.status === 'fulfilled') setComplexityData(compRes.value);
        if (gitRes.status === 'fulfilled') setGitData(gitRes.value);
      } catch (e) {
        console.error("Error fetching gemcheck reports:", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-8 bg-brand-white">
        <div className="text-3xl font-black uppercase tracking-widest text-brand-black">Cargando Auditoría...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col p-8 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-brand-black pb-6">
        <p className="text-sm font-bold tracking-widest uppercase mb-2">REPORTE OFICIAL</p>
        <h1 className="text-5xl font-black uppercase tracking-tight">AUDITORÍA GEMCHECK</h1>
        <div className="mt-6 bg-brand-black text-brand-white inline-block px-4 py-2 font-bold uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(46,204,113,1)]">
          Veredicto: Calidad del código fuente y métricas evolutivas.
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('scan')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-2 border-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${activeTab === 'scan' ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('complexity')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-2 border-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${activeTab === 'complexity' ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black'}`}
        >
          Complejidad
        </button>
        <button 
          onClick={() => setActiveTab('git')}
          className={`px-6 py-3 font-bold uppercase tracking-wider border-2 border-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${activeTab === 'git' ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black'}`}
        >
          Git Activity
        </button>
      </div>

      <div className="flex-1 w-full bg-brand-white p-4 border-4 border-brand-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {activeTab === 'scan' && (
          scanData ? <ScanDashboard data={scanData} /> : <div className="text-brand-black text-xl font-bold p-8">No se encontró el reporte general.</div>
        )}
        {activeTab === 'complexity' && (
          complexityData ? <ComplexityDashboard complexityData={complexityData} /> : <div className="text-brand-black text-xl font-bold p-8">No se encontró el reporte de complejidad.</div>
        )}
        {activeTab === 'git' && (
          gitData ? <GitDashboard gitActivity={gitData} /> : <div className="text-brand-black text-xl font-bold p-8">No se encontró el reporte de Git.</div>
        )}
      </div>
    </div>
  );
}
