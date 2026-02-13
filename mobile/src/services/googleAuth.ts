// Google Sign-In deshabilitado en Expo Go (requiere build nativo)
// Se reactivara cuando se haga un build con EAS

export const configureGoogleSignIn = () => {};

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
  async signIn(): Promise<GoogleAuthResult> {
    return {
      success: false,
      error: 'Google Sign-In no disponible en Expo Go. Usa el login de desarrollo.',
      errorCode: 'NOT_AVAILABLE',
    };
  },

  async signOut(): Promise<void> {},

  async isSignedIn(): Promise<boolean> {
    return false;
  },

  async getCurrentUser(): Promise<GoogleUser | null> {
    return null;
  },
};
