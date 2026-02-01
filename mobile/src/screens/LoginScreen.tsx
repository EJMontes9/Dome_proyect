import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar Google Sign-In real
      // Por ahora usamos un login de prueba para desarrollo
      const result = await authService.loginWithGoogle('mock-token');

      if (result.success && result.data) {
        await setAuth(result.data.user, result.data.access_token);
      } else {
        Alert.alert('Error', result.error || 'Error al iniciar sesion');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Login de desarrollo (sin Google OAuth real)
  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.devLogin();

      if (result.success && result.data) {
        await setAuth(result.data.user, result.data.access_token);
      } else {
        Alert.alert('Error', result.error || 'Error al iniciar sesion');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>
        Inicia sesion con tu cuenta de Google para acceder a tus cursos
      </Text>

      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
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

      {/* Boton de desarrollo */}
      <TouchableOpacity
        style={styles.devButton}
        onPress={handleDevLogin}
        disabled={isLoading}
      >
        <Text style={styles.devButtonText}>
          Login de Desarrollo (sin Google)
        </Text>
      </TouchableOpacity>

      <Text style={styles.notice}>
        Solo podras acceder si tu correo esta registrado en el campus virtual
      </Text>
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
    opacity: 0.7,
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
  devButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30,
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
});
