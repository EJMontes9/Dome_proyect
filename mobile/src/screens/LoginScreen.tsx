import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/authService';
import { googleAuthService, configureGoogleSignIn } from '../services/googleAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'dev' | null>(null);
  const [moodleStatus, setMoodleStatus] = useState<{
    checked: boolean;
    connected: boolean;
    siteName?: string;
  }>({ checked: false, connected: false });

  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // Configurar Google Sign-In al montar
    configureGoogleSignIn();
    // Verificar conexion con Moodle
    checkMoodleConnection();
  }, []);

  const checkMoodleConnection = async () => {
    const result = await authService.checkMoodleStatus();
    if (result.success && result.data) {
      setMoodleStatus({
        checked: true,
        connected: result.data.connected,
        siteName: result.data.site_name,
      });
    } else {
      setMoodleStatus({ checked: true, connected: false });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingType('google');

    try {
      // 1. Obtener token de Google
      const googleResult = await googleAuthService.signIn();

      if (!googleResult.success || !googleResult.user) {
        if (googleResult.errorCode !== 'CANCELLED') {
          Alert.alert('Error', googleResult.error || 'Error con Google Sign-In');
        }
        return;
      }

      // 2. Enviar token al backend
      const result = await authService.loginWithGoogle(googleResult.user.idToken);

      if (result.success && result.data) {
        await setAuth(
          result.data.user,
          result.data.access_token,
          result.data.refresh_token
        );
      } else {
        Alert.alert('Error', result.error || 'Error al iniciar sesion');
        // Cerrar sesion de Google si falla la validacion
        await googleAuthService.signOut();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    setLoadingType('dev');

    try {
      const result = await authService.devLogin();

      if (result.success && result.data) {
        await setAuth(
          result.data.user,
          result.data.access_token,
          result.data.refresh_token
        );
      } else {
        Alert.alert('Error de Conexion', result.error || 'Error al iniciar sesion');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        {moodleStatus.checked ? (
          moodleStatus.connected ? (
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, styles.statusConnected]} />
              <Text style={styles.statusText}>
                Conectado a {moodleStatus.siteName || 'Moodle'}
              </Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, styles.statusDisconnected]} />
              <Text style={styles.statusText}>Sin conexion al servidor</Text>
            </View>
          )
        ) : (
          <View style={styles.statusBadge}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.statusText}>Verificando conexion...</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Inicia sesion con tu cuenta de Google para acceder a tus cursos del campus virtual
      </Text>

      {/* Google Login Button */}
      <TouchableOpacity
        style={[
          styles.googleButton,
          isLoading && styles.buttonDisabled,
          !moodleStatus.connected && styles.buttonDisabled,
        ]}
        onPress={handleGoogleLogin}
        disabled={isLoading || !moodleStatus.connected}
      >
        {loadingType === 'google' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Separator */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>o</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Dev Login Button */}
      <TouchableOpacity
        style={[styles.devButton, isLoading && styles.buttonDisabled]}
        onPress={handleDevLogin}
        disabled={isLoading}
      >
        {loadingType === 'dev' ? (
          <ActivityIndicator color="#666" />
        ) : (
          <Text style={styles.devButtonText}>
            Entrar como Administrador (Dev)
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.notice}>
        Solo podras acceder si tu correo esta registrado en el campus virtual.
        {'\n'}
        El boton de desarrollo usa el usuario admin de Moodle.
      </Text>

      {/* Retry connection button */}
      {moodleStatus.checked && !moodleStatus.connected && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkMoodleConnection}
        >
          <Text style={styles.retryButtonText}>Reintentar conexion</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    justifyContent: 'center',
  },
  statusContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#4caf50',
  },
  statusDisconnected: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285f4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  devButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
    minHeight: 50,
  },
  devButtonText: {
    color: '#666',
    fontSize: 14,
  },
  notice: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#1e88e5',
    fontSize: 14,
    fontWeight: '500',
  },
});
