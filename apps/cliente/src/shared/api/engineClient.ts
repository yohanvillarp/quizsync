import axios from 'axios';

const ENGINE_BASE_URL = import.meta.env.VITE_ENGINE_URL || 'http://localhost:3002/api';

export const engineClient = axios.create({
  baseURL: ENGINE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
