import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// Configurar Google Sign-In
// IMPORTANTE: Reemplazar con tu Web Client ID de Google Cloud Console
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['email', 'profile'],
  });
};

export interface GoogleUser {
  idToken: string;
  email: string;
  name: string;
  photo?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  errorCode?: string;
}

export const googleAuthService = {
  /**
   * Inicia el flujo de Google Sign-In
   */
  async signIn(): Promise<GoogleAuthResult> {
    try {
      // Verificar que Google Play Services esta disponible
      await GoogleSignin.hasPlayServices();

      // Iniciar sesion
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        return {
          success: false,
          error: 'No se pudo obtener el token de Google',
        };
      }

      return {
        success: true,
        user: {
          idToken: userInfo.data.idToken,
          email: userInfo.data.user.email,
          name: userInfo.data.user.name || '',
          photo: userInfo.data.user.photo || undefined,
        },
      };
    } catch (error: any) {
      // Manejar errores especificos de Google Sign-In
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: 'Inicio de sesion cancelado',
          errorCode: 'CANCELLED',
        };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Inicio de sesion en progreso',
          errorCode: 'IN_PROGRESS',
        };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: 'Google Play Services no disponible',
          errorCode: 'PLAY_SERVICES_NOT_AVAILABLE',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Error desconocido',
          errorCode: 'UNKNOWN',
        };
      }
    }
  },

  /**
   * Cierra sesion de Google
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  },

  /**
   * Verifica si el usuario ya tiene sesion activa en Google
   */
  async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch {
      return false;
    }
  },

  /**
   * Obtiene el usuario actual de Google (si existe sesion)
   */
  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (!userInfo?.idToken) return null;

      return {
        idToken: userInfo.idToken,
        email: userInfo.user.email,
        name: userInfo.user.name || '',
        photo: userInfo.user.photo || undefined,
      };
    } catch {
      return null;
    }
  },
};
