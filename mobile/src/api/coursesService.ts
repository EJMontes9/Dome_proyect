import { apiClient, ApiResponse } from './config';

export interface Course {
  id: number;
  shortname: string;
  fullname: string;
  summary?: string;
  startdate?: number;
  enddate?: number;
}

export interface CourseModule {
  id: number;
  name: string;
  instance: number;
  modname: string;
  modplural: string;
  url?: string;
}

export interface CourseContent {
  id: number;
  name: string;
  summary?: string;
  modules: CourseModule[];
}

export const coursesService = {
  /**
   * Obtiene todos los cursos del usuario
   */
  async getUserCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const response = await apiClient.get<Course[]>('/courses');
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Error al cargar cursos';
      return { success: false, error: message };
    }
  },

  /**
   * Obtiene el detalle de un curso
   */
  async getCourseDetail(courseId: number): Promise<ApiResponse<Course>> {
    try {
      const response = await apiClient.get<Course>(`/courses/${courseId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Error al cargar detalle del curso';
      return { success: false, error: message };
    }
  },

  /**
   * Obtiene el contenido (secciones y modulos) de un curso
   */
  async getCourseContents(
    courseId: number
  ): Promise<ApiResponse<CourseContent[]>> {
    try {
      const response = await apiClient.get<CourseContent[]>(
        `/courses/${courseId}/contents`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.detail || 'Error al cargar contenido del curso';
      return { success: false, error: message };
    }
  },
};
