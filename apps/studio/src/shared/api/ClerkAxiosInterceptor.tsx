import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/api/apiClient";

export function ClerkAxiosInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Interceptamos todas las peticiones salientes
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error injectando token de Clerk:", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Limpieza al desmontar
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
}
