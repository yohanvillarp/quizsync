import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FolderGit2 } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Reportes E2E', path: '/reports' },
    { name: 'Stress Test', path: '/stress' },
    { name: 'Auditoría Gemcheck', path: '/audit' }
  ];

  return (
    <nav className="bg-brand-white border-b-4 border-brand-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <ShieldCheck className="w-8 h-8 text-brand-black" strokeWidth={2.5} />
              <span className="text-2xl font-black tracking-widest uppercase">QA_PORTAL</span>
            </Link>
            
            <div className="flex flex-wrap gap-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    location.pathname === link.path
                      ? 'bg-brand-black text-brand-white'
                      : 'bg-transparent text-brand-black border-2 border-transparent hover:border-brand-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://gemcheck.nikelyh.tech/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-brand-white border-2 border-brand-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <FolderGit2 className="w-5 h-5 text-brand-black" strokeWidth={2.5} />
              <span className="font-bold text-sm tracking-widest">NIKELYH</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
