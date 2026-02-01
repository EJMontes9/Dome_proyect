import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// URL del backend (cambiar en produccion)
export const API_URL = 'http://localhost:8000';

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o invalido
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      // Aqui podrias emitir un evento para hacer logout
    }
    return Promise.reject(error);
  }
);

// Tipo generico para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
