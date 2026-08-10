export function HomePage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-azure-text mb-4 tracking-tight">
          Bienvenido al Portal de QA
        </h1>
        <p className="text-lg text-azure-text-sec max-w-2xl mx-auto">
          Aquí centralizamos todos los reportes de calidad, pruebas end-to-end y métricas de carga del motor de QuizSync.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-azure-surface border border-azure-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-azure-blue mb-3">Pruebas End-to-End (Playwright)</h2>
          <p className="text-azure-text-sec mb-4">
            Revisa los resultados detallados de los flujos automáticos sobre la interfaz gráfica y funcionalidades principales.
          </p>
          <a href="/reports" className="text-azure-blue font-semibold hover:underline">
            Ver Reportes E2E &rarr;
          </a>
        </div>
        
        <div className="bg-azure-surface border border-azure-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-azure-blue mb-3">Pruebas de Estrés (Artillery)</h2>
          <p className="text-azure-text-sec mb-4">
            Monitorea el rendimiento del Game Engine y la capacidad de los websockets bajo carga masiva de usuarios.
          </p>
          <a href="/stress" className="text-azure-blue font-semibold hover:underline">
            Ver Métricas de Red &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
