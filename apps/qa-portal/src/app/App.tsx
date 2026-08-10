import { Routes, Route } from 'react-router-dom';
import { Navbar } from '../widgets/Navbar/ui/Navbar';
import { HomePage } from '../pages/Home/ui/HomePage';
import { ReportsPage } from '../pages/Reports/ui/ReportsPage';

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
            <div className="h-[calc(100vh-64px)] w-full flex flex-col">
              <iframe 
                src="/stress-raw/index.html" 
                title="Artillery Stress Report"
                className="w-full h-full border-none flex-1"
              ></iframe>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
