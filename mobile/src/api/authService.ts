import { apiClient, ApiResponse } from './config';

// ==================== Types ====================

export interface User {
  id: number;
  email: string;
  fullname: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface MoodleStatus {
  connected: boolean;
  site_name?: string;
  error?: string;
}

// ==================== Service ====================

export const authService = {
  /**
   * Inicia sesion con un token de Google OAuth
   */
  async loginWithGoogle(idToken: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/google', {
        id_token: idToken,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al iniciar sesion';
      const status = error.response?.status;

      // Mensajes de error mas descriptivos
      if (status === 401) {
        return { success: false, error: 'Token de Google invalido. Intenta de nuevo.' };
      } else if (status === 403) {
        return {
          success: false,
          error: 'Tu correo no esta registrado en el campus virtual. Contacta al administrador.',
        };
      }

      return { success: false, error: message };
    }
  },

  /**
   * Login de desarrollo (sin Google OAuth real)
   * Solo para pruebas locales cuando el backend esta en modo debug
   */
  async devLogin(email?: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/dev-login', {
        email: email || null,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al iniciar sesion';
      const status = error.response?.status;

      if (status === 403) {
        return {
          success: false,
          error: 'El modo desarrollo no esta habilitado en el servidor.',
        };
      } else if (status === 404) {
        return {
          success: false,
          error: 'Usuario no encontrado en Moodle.',
        };
      }

      // Si no hay conexion, dar mensaje claro
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          error: 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.',
        };
      }

      return { success: false, error: message };
    }
  },

  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al refrescar token';
      return { success: false, error: message };
    }
  },

  /**
   * Obtiene informacion del usuario actual
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al obtener usuario';
      return { success: false, error: message };
    }
  },

  /**
   * Verifica el estado de conexion con Moodle
   */
  async checkMoodleStatus(): Promise<ApiResponse<MoodleStatus>> {
    try {
      const response = await apiClient.get<MoodleStatus>('/auth/moodle-status');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: 'No se pudo verificar la conexion con Moodle',
      };
    }
  },
};
