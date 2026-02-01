import { apiClient, ApiResponse } from './config';

interface User {
  id: number;
  email: string;
  fullname: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

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
      const message =
        error.response?.data?.detail || 'Error al iniciar sesion';
      return { success: false, error: message };
    }
  },

  /**
   * Login de desarrollo (sin Google OAuth real)
   * Solo para pruebas locales
   */
  async devLogin(): Promise<ApiResponse<LoginResponse>> {
    try {
      // Este endpoint deberia crearse en el backend solo para desarrollo
      const response = await apiClient.post<LoginResponse>('/auth/dev-login');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Si el endpoint no existe, simular un login exitoso para desarrollo
      const mockResponse: LoginResponse = {
        access_token: 'dev-token-' + Date.now(),
        token_type: 'bearer',
        user: {
          id: 2,
          email: 'estudiante@test.com',
          fullname: 'Estudiante de Prueba',
        },
      };
      return { success: true, data: mockResponse };
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
};
