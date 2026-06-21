import axios from 'axios';

// Obtenemos la URL desde las variables de entorno (definida en .env o .env.local)
// Fallback a localhost solo en caso de que no esté definida en dev, pero en cloud usará VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 5000,
});

// Interceptores para manejo global de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
