import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración global para las pruebas End-to-End (E2E) con Playwright.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Carpeta donde se encuentran nuestras pruebas funcionales
  testDir: './tests/e2e',
  
  // Ejecutar las pruebas en paralelo para mayor velocidad
  fullyParallel: true,
  
  // Falla la construcción en CI si por accidente dejamos un test.only en el código
  forbidOnly: !!process.env.CI,
  
  // Reintentar pruebas fallidas 2 veces en CI, 0 veces localmente
  retries: process.env.CI ? 2 : 0,
  
  // Número máximo de workers paralelos
  workers: process.env.CI ? 1 : undefined,
  
  // Formato del reporte de resultados
  reporter: 'html',
  
  // Opciones compartidas para todas las pruebas
  use: {
    // Recopilar el rastreo (trace) cuando una prueba falla para poder debuggearla
    trace: 'on-first-retry',
    
    // Grabar un video si la prueba falla
    video: 'retain-on-failure',
  },

  // Proyectos para configurar múltiples navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
