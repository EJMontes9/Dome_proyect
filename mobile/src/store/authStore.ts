import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../api/authService';

// ==================== Types ====================

interface User {
  id: number;
  email: string;
  fullname: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

// ==================== Storage Keys ====================

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

// ==================== Store ====================

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Guarda los datos de autenticacion
   */
  setAuth: async (user: User, token: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  /**
   * Cierra sesion y limpia los datos almacenados
   */
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /**
   * Carga los datos de autenticacion almacenados
   */
  loadStoredAuth: async () => {
    try {
      const [token, refreshToken, userStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Intentar refrescar el token en segundo plano
        // para asegurar que sea valido
        get().refreshAccessToken();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Refresca el token de acceso usando el refresh token
   * Retorna true si fue exitoso, false si no
   */
  refreshAccessToken: async (): Promise<boolean> => {
    const { refreshToken, logout } = get();

    if (!refreshToken) {
      return false;
    }

    try {
      const result = await authService.refreshToken(refreshToken);

      if (result.success && result.data) {
        // Actualizar tokens
        await SecureStore.setItemAsync(TOKEN_KEY, result.data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.data.refresh_token);

        set({
          token: result.data.access_token,
          refreshToken: result.data.refresh_token,
          user: result.data.user,
        });

        return true;
      } else {
        // Refresh token invalido, cerrar sesion
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },
}));

// ==================== Selector Hooks ====================

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
