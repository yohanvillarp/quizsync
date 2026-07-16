import { useEffect } from 'react';

/**
 * PWAProvider
 * 
 * En el futuro, este proveedor puede expandirse para escuchar eventos de 
 * "nueva versión disponible" o "offline ready" usando virtual:pwa-register
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Si queremos lógica custom de registro en el futuro, iría aquí.
    // Actualmente vite-plugin-pwa inyecta el registro automático en index.html 
    // gracias a injectRegister: 'auto'
  }, []);

  return <>{children}</>;
}
