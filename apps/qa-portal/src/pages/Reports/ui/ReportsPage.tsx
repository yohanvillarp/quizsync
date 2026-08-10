export function ReportsPage() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-azure-text mb-2">Reportes E2E (Playwright)</h1>
        <p className="text-azure-text-sec">
          Resultados de las pruebas de integración en el entorno gráfico. 
        </p>
      </div>

      <div className="flex-1 bg-azure-surface border border-azure-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <iframe 
          src="/e2e-raw/index.html" 
          title="Playwright Report"
          className="w-full h-full border-none flex-1"
        ></iframe>
      </div>
    </div>
  );
}
