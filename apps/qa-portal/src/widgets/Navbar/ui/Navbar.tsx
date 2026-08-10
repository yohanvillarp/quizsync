import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Inicio', path: '/' },
    { name: 'Reportes de QA', path: '/reports' },
    { name: 'Pruebas de Carga', path: '/stress' },
  ];

  return (
    <nav className="bg-azure-surface border-b border-azure-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-azure-blue">QuizSync QA</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'border-azure-blue text-azure-text'
                      : 'border-transparent text-azure-text-sec hover:border-gray-300 hover:text-azure-text'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-azure-text-sec hidden md:block">
              Portal Interno de Calidad
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
