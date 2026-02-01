import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { coursesService, CourseContent } from '../api/coursesService';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId, courseName } = route.params;
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContents();
  }, [courseId]);

  const loadContents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await coursesService.getCourseContents(courseId);
      if (result.success && result.data) {
        setContents(result.data);
      } else {
        setError(result.error || 'Error al cargar contenido');
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleIcon = (modname: string) => {
    switch (modname) {
      case 'assign':
        return '📝';
      case 'forum':
        return '💬';
      case 'resource':
        return '📄';
      case 'url':
        return '🔗';
      case 'quiz':
        return '❓';
      case 'page':
        return '📃';
      default:
        return '📁';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text style={styles.loadingText}>Cargando contenido...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadContents}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {contents.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionName}>{section.name}</Text>
          {section.summary && (
            <Text style={styles.sectionSummary}>
              {section.summary.replace(/<[^>]*>/g, '')}
            </Text>
          )}

          {section.modules.map((module: any) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => {
                // TODO: Navegar segun el tipo de modulo
                if (module.modname === 'assign') {
                  // navigation.navigate('AssignmentDetail', { assignmentId: module.instance });
                } else if (module.modname === 'forum') {
                  // navigation.navigate('ForumList', { forumId: module.instance });
                }
              }}
            >
              <Text style={styles.moduleIcon}>
                {getModuleIcon(module.modname)}
              </Text>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{module.name}</Text>
                <Text style={styles.moduleType}>
                  {module.modname === 'assign'
                    ? 'Tarea'
                    : module.modname === 'forum'
                    ? 'Foro'
                    : module.modname === 'resource'
                    ? 'Recurso'
                    : module.modname}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {contents.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Este curso no tiene contenido visible
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 12,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionSummary: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  moduleType: {
    fontSize: 13,
    color: '#999',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
