import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ==================== Configuration ====================

// URL del backend (cambiar segun el entorno)
// Para Android emulator: http://10.0.2.2:8000
// Para iOS simulator: http://localhost:8000
// Para dispositivo fisico: http://<tu-ip-local>:8000
export const API_URL = 'http://10.0.2.2:8000';

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// ==================== Axios Instance ====================

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Request Interceptor ====================

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
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

// ==================== Response Interceptor ====================

// Flag para evitar loops infinitos de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si es un 401 y no hemos intentado refresh aun
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si el endpoint es de auth, no intentar refresh
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Ya estamos refrescando, encolar esta peticion
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        await SecureStore.setItemAsync(TOKEN_KEY, access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

        // Procesar cola de peticiones pendientes
        processQueue(null);

        // Reintentar la peticion original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh fallo, limpiar tokens
        processQueue(refreshError as AxiosError);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync('auth_user');

        // Aqui podrias emitir un evento para notificar al store
        // que debe hacer logout
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==================== Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
