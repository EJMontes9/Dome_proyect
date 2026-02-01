# Documento de Requisitos
## Aplicación Móvil Cliente para Moodle

**Versión:** 1.0  
**Fecha:** 7 de diciembre de 2025  
**Asignatura:** Programación de Dispositivos Móviles

---

## 1. Introducción

### 1.1 Propósito
Este documento define los requisitos funcionales y no funcionales para el desarrollo de una aplicación móvil cliente que se comunique con una instancia de Moodle mediante API REST y autenticación unificada (SSO).

### 1.2 Alcance
La aplicación simulará el escenario de una institución educativa que requiere una app móvil conectada a su campus virtual, permitiendo a los estudiantes acceder a cursos, actividades, tareas y foros desde sus dispositivos móviles.

### 1.3 Definiciones y Acrónimos
- **LMS:** Learning Management System
- **SSO:** Single Sign-On (Inicio de Sesión Único)
- **REST:** Representational State Transfer
- **OAuth 2.0:** Protocolo de autorización
- **API:** Application Programming Interface

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema se compone de tres elementos principales:
1. **Aplicación móvil:** Interfaz de usuario y lógica de interacción
2. **Backend intermedio (opcional):** Gestión de autenticación y simplificación de servicios
3. **Servidor Moodle:** LMS que expone servicios REST y almacena datos

### 2.2 Funcionalidades del Producto
- Autenticación mediante OAuth 2.0 con Google
- Visualización de cursos matriculados
- Acceso a actividades, tareas y foros
- Envío de entregas de tareas
- Participación en foros de discusión

### 2.3 Usuarios del Sistema
| Usuario | Descripción |
|---------|-------------|
| Estudiante | Usuario principal que accede a sus cursos y realiza actividades |
| Docente/Administrador | Usuario para pruebas y configuración del sistema |

---

## 3. Requisitos Funcionales

### 3.1 Módulo de Autenticación

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-001 | El sistema debe mostrar una pantalla de bienvenida con el nombre de la aplicación | Alta |
| RF-002 | El sistema debe permitir inicio de sesión mediante OAuth 2.0 con Google | Alta |
| RF-003 | El sistema debe validar que el correo del usuario exista en Moodle | Alta |
| RF-004 | El sistema debe gestionar y almacenar tokens de autenticación de forma segura | Alta |

### 3.2 Módulo de Cursos

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-005 | El sistema debe listar todos los cursos en los que el usuario está matriculado | Alta |
| RF-006 | El sistema debe mostrar para cada curso: nombre, shortname y docente | Alta |
| RF-007 | El sistema debe permitir acceder al detalle de cada curso | Alta |

### 3.3 Módulo de Actividades

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-008 | El sistema debe listar las actividades disponibles en cada curso | Alta |
| RF-009 | El sistema debe mostrar tareas, foros y recursos del curso | Alta |
| RF-010 | El sistema debe mostrar fechas de entrega, estado y tipo de cada actividad | Alta |

### 3.4 Módulo de Tareas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-011 | El sistema debe permitir el envío de entregas de tareas en formato texto | Alta |
| RF-012 | El sistema debe permitir adjuntar archivos a las entregas (según disponibilidad) | Media |
| RF-013 | El sistema debe mostrar el estado de las entregas realizadas | Alta |

### 3.5 Módulo de Foros

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-014 | El sistema debe listar las discusiones disponibles en cada foro | Alta |
| RF-015 | El sistema debe permitir leer los mensajes de cada discusión | Alta |
| RF-016 | El sistema debe permitir publicar participaciones en los foros | Alta |

### 3.6 Requisitos Opcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-017 | El sistema puede implementar notificaciones push mediante Firebase | Baja |
| RF-018 | El sistema puede implementar almacenamiento local (SQLite, Room) | Baja |
| RF-019 | El sistema puede soportar modo offline | Baja |

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento

| ID | Requisito |
|----|-----------|
| RNF-001 | La aplicación debe cargar la lista de cursos en menos de 3 segundos con conexión estable |
| RNF-002 | Las llamadas a la API REST deben tener un timeout máximo de 30 segundos |

### 4.2 Seguridad

| ID | Requisito |
|----|-----------|
| RNF-003 | Todas las comunicaciones deben realizarse mediante HTTPS |
| RNF-004 | Los tokens de autenticación deben almacenarse de forma segura en el dispositivo |
| RNF-005 | Las credenciales del usuario nunca deben almacenarse en texto plano |

### 4.3 Usabilidad

| ID | Requisito |
|----|-----------|
| RNF-006 | La interfaz debe ser intuitiva y fácil de navegar |
| RNF-007 | La aplicación debe proporcionar feedback visual durante operaciones de carga |
| RNF-008 | Los mensajes de error deben ser claros y orientados al usuario |

### 4.4 Compatibilidad

| ID | Requisito |
|----|-----------|
| RNF-009 | La aplicación debe ser compatible con Android 8.0 (API 26) o superior |
| RNF-010 | Si se usa Flutter/React Native, debe funcionar en iOS 12.0 o superior |

### 4.5 Mantenibilidad

| ID | Requisito |
|----|-----------|
| RNF-011 | El código debe seguir una arquitectura por capas (presentación, servicios, datos) |
| RNF-012 | El código debe estar documentado y seguir buenas prácticas de desarrollo |

---

## 5. Requisitos del Entorno

### 5.1 Servidor Moodle

| ID | Requisito |
|----|-----------|
| RE-001 | Moodle debe estar instalado en entorno local (XAMPP, WAMP, o máquina virtual) |
| RE-002 | Moodle debe ser accesible desde la red local |
| RE-003 | Los Servicios Web deben estar activados |
| RE-004 | El protocolo REST debe estar habilitado |
| RE-005 | Debe existir un servicio configurado con las funciones requeridas |
| RE-006 | Debe generarse un token de servicio asociado a un usuario autorizado |

### 5.2 Funciones API Requeridas

El servicio de Moodle debe incluir las siguientes funciones:
- Listar cursos del usuario
- Obtener actividades del curso
- Envío de tareas
- Lectura de foros
- Publicación en foros

### 5.3 Datos de Prueba

| Elemento | Descripción |
|----------|-------------|
| Curso de pruebas | Al menos un curso configurado con actividades |
| Usuario estudiante | Cuenta de estudiante matriculado en el curso |
| Usuario docente | Cuenta con permisos de administración |

---

## 6. Arquitectura del Sistema

### 6.1 Capas de la Aplicación

```
┌─────────────────────────────────────┐
│     Capa de Presentación            │
│  (Pantallas, Navegación, UI)        │
├─────────────────────────────────────┤
│     Capa de Servicios               │
│  (API REST, Tokens, Mapeo JSON)     │
├─────────────────────────────────────┤
│     Capa de Datos                   │
│  (Almacenamiento Local/Persistente) │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Backend Intermedio (Opcional)     │
│  (OAuth 2.0, Validación, Push)      │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│      Servidor Moodle Local          │
│    (API REST + Base de Datos)       │
└─────────────────────────────────────┘
```

### 6.2 Tecnologías Recomendadas

**Desarrollo Móvil:**
- Android Nativo (Kotlin o Java)
- Flutter (Dart)
- React Native (JavaScript/TypeScript)

**Backend Intermedio (opcional):**
- Node.js + Express
- Python (FastAPI / Flask)
- Java Spring Boot

---

## 7. Entregables

### 7.1 Código Fuente
- Repositorio Git con código de la aplicación móvil
- Backend intermedio (si aplica)
- Archivo README con instrucciones de instalación y ejecución

### 7.2 Informe Técnico
1. Portada
2. Introducción y objetivos
3. Arquitectura implementada
4. Instalación y configuración de Moodle
5. Documentación de pantallas
6. Casos de prueba
7. Conclusiones y mejoras propuestas

### 7.3 Video Demostrativo
- Duración: 5-8 minutos
- Demostración de todas las funcionalidades implementadas

---

## 8. Criterios de Aceptación

| Criterio | Peso | Descripción |
|----------|------|-------------|
| C1. Funcionamiento | 40% | Login, visualización de cursos, gestión de tareas y foros |
| C2. Calidad del código | 25% | Arquitectura por capas, buenas prácticas de desarrollo |
| C3. Interfaz gráfica | 15% | Claridad, usabilidad y experiencia de usuario |
| C4. Informe técnico | 10% | Documentación completa y bien estructurada |
| C5. Alcance adicional | 10% | Notificaciones push, modo offline, mejoras extras |

---

## 9. Matriz de Trazabilidad

| Objetivo | Requisitos Asociados |
|----------|---------------------|
| O1. Instalar y configurar Moodle | RE-001, RE-002, RE-003, RE-004, RE-005, RE-006 |
| O2. Consumir endpoints REST | RF-005, RF-006, RF-008, RF-009 |
| O3. Implementar OAuth 2.0 | RF-001, RF-002, RF-003, RF-004 |
| O4. Desarrollar cliente móvil | RF-005 a RF-016 |
| O5. Notificaciones push | RF-017 |
| O6. Arquitectura por capas | RNF-011, RNF-012 |

---

## 10. Apéndice: Glosario de Endpoints API

| Funcionalidad | Endpoint Moodle (ejemplo) |
|---------------|---------------------------|
| Información del sitio | `core_webservice_get_site_info` |
| Cursos del usuario | `core_enrol_get_users_courses` |
| Contenido del curso | `core_course_get_contents` |
| Envío de tarea | `mod_assign_save_submission` |
| Discusiones del foro | `mod_forum_get_forum_discussions` |
| Publicar en foro | `mod_forum_add_discussion_post` |

---

*Documento generado como parte del Proyecto Integrador de Programación de Dispositivos Móviles.*
