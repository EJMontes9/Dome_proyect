# Moodle Mobile - Aplicacion Cliente

Aplicacion movil cliente para Moodle desarrollada con React Native (Expo) y FastAPI.

**Asignatura:** Programacion de Dispositivos Moviles
**Version:** 1.0.0

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Pantallas de la App](#pantallas-de-la-app)
- [Tecnologias](#tecnologias)

---

## Descripcion

Sistema compuesto por:
- **App Movil (React Native):** Interfaz para estudiantes
- **Backend API (FastAPI):** Intermediario entre la app y Moodle
- **Moodle (Docker):** LMS para desarrollo y pruebas

### Funcionalidades Implementadas

| Modulo | Estado | Descripcion |
|--------|--------|-------------|
| Autenticacion | ✅ Completo | OAuth 2.0 con Google + JWT con refresh tokens |
| Cursos | 🔲 Pendiente | Lista de cursos matriculados |
| Tareas | 🔲 Pendiente | Ver y enviar tareas |
| Foros | 🔲 Pendiente | Participar en discusiones |
| Modo Offline | 🔲 Pendiente | Cache local con SQLite |

---

## Arquitectura

```
┌─────────────────────────────────────┐
│     App Movil (React Native)        │
│  - Expo + TypeScript                │
│  - Zustand (estado)                 │
│  - Axios (HTTP)                     │
└─────────────────┬───────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────┐
│     Backend API (FastAPI)           │
│  - JWT Authentication               │
│  - Moodle Client                    │
│  - OAuth 2.0 Google                 │
└─────────────────┬───────────────────┘
                  │ HTTP
                  ▼
┌─────────────────────────────────────┐
│     Moodle (Docker)                 │
│  - Bitnami Moodle 4.3               │
│  - MariaDB 10.6                     │
│  - REST Web Services                │
└─────────────────────────────────────┘
```

---

## Requisitos

| Software | Version |
|----------|---------|
| Docker Desktop | 20.0+ |
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Instalacion

### 1. Clonar el repositorio

```powershell
git clone <repo-url>
cd Dome_proyect
```

### 2. Levantar Moodle (Docker)

```powershell
cd docker
docker-compose up -d
```

Espera 2-3 minutos. Accede a http://localhost:8080
- **Usuario:** `admin`
- **Contrasena:** `Admin123!`

### 3. Configurar servicios web en Moodle

1. Ir a **Administracion del sitio > Servidor > Servicios web > Vista general**
2. Habilitar servicios web: **Si**
3. Habilitar protocolo REST: **Si**
4. Crear servicio externo:
   - Nombre: `mobile_app`
   - Funciones requeridas:
     - `core_webservice_get_site_info`
     - `core_enrol_get_users_courses`
     - `core_course_get_contents`
     - `core_user_get_users`
     - `mod_assign_get_assignments`
     - `mod_assign_get_submission_status`
     - `mod_assign_save_submission`
     - `mod_forum_get_forums_by_courses`
     - `mod_forum_get_forum_discussions`
     - `mod_forum_get_discussion_posts`
     - `mod_forum_add_discussion_post`
5. Crear token para usuario admin
6. Copiar el token generado

### 4. Configurar Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

Crear archivo `.env`:
```env
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=<tu_token_de_moodle>
GOOGLE_CLIENT_ID=<tu_client_id_de_google>
JWT_SECRET=<secreto_aleatorio_seguro>
DEBUG=true
```

Ejecutar servidor:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0
```

API disponible en http://localhost:8000/docs

### 5. Configurar App Movil

```powershell
cd mobile
npm install
npx expo start
```

Escanear QR con Expo Go o usar emulador.

---

## Estructura del Proyecto

```
Dome_proyect/
├── docker/                      # Moodle en Docker
│   ├── docker-compose.yml       # Configuracion de servicios
│   ├── setup-moodle.ps1         # Script de inicializacion
│   └── .gitignore
│
├── backend/                     # API FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point
│   │   ├── config.py            # Configuracion
│   │   ├── routers/
│   │   │   ├── auth.py          # Autenticacion
│   │   │   ├── courses.py       # Cursos
│   │   │   ├── assignments.py   # Tareas
│   │   │   └── forums.py        # Foros
│   │   ├── services/
│   │   │   ├── moodle_client.py # Cliente Moodle API
│   │   │   └── oauth_service.py # Google OAuth
│   │   └── utils/
│   │       └── security.py      # JWT tokens
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── mobile/                      # App React Native
│   ├── App.tsx                  # Entry point
│   ├── src/
│   │   ├── api/
│   │   │   ├── config.ts        # Axios config
│   │   │   ├── authService.ts   # Auth API
│   │   │   └── coursesService.ts# Courses API
│   │   ├── navigation/
│   │   │   └── RootNavigator.tsx
│   │   ├── screens/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   └── CourseDetailScreen.tsx
│   │   ├── services/
│   │   │   └── googleAuth.ts    # Google Sign-In
│   │   └── store/
│   │       └── authStore.ts     # Zustand store
│   ├── package.json
│   ├── app.json
│   └── tsconfig.json
│
└── README.md
```

---

## API Reference

### Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/auth/google` | Login con token de Google |
| POST | `/auth/dev-login` | Login de desarrollo (solo debug) |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/auth/me` | Info del usuario autenticado |
| GET | `/auth/moodle-status` | Estado de conexion con Moodle |

### Cursos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/courses` | Lista cursos del usuario |
| GET | `/courses/{id}` | Detalle de un curso |
| GET | `/courses/{id}/contents` | Secciones y modulos |

### Tareas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/assignments/course/{id}` | Tareas del curso |
| GET | `/assignments/{id}` | Detalle de tarea |
| GET | `/assignments/{id}/submission` | Estado de entrega |
| POST | `/assignments/{id}/submit` | Enviar entrega |

### Foros

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/forums/course/{id}` | Foros del curso |
| GET | `/forums/{id}/discussions` | Discusiones |
| GET | `/forums/discussions/{id}/posts` | Mensajes |
| POST | `/forums/discussions/{id}/reply` | Responder |

---

## Pantallas de la App

| Pantalla | Archivo | Descripcion |
|----------|---------|-------------|
| Welcome | `WelcomeScreen.tsx` | Splash con logo y boton de login |
| Login | `LoginScreen.tsx` | Google Sign-In + login dev |
| Home | `HomeScreen.tsx` | Lista de cursos matriculados |
| Course Detail | `CourseDetailScreen.tsx` | Secciones y actividades |

---

## Tecnologias

### Backend
- **FastAPI** - Framework web async
- **Pydantic** - Validacion de datos
- **python-jose** - JWT tokens
- **httpx** - Cliente HTTP async
- **google-auth** - Verificacion OAuth

### Mobile
- **React Native** - Framework movil
- **Expo** - Toolchain y servicios
- **TypeScript** - Tipado estatico
- **Zustand** - Estado global
- **Axios** - Cliente HTTP
- **expo-secure-store** - Almacenamiento seguro

### Infraestructura
- **Docker** - Contenedores
- **Moodle 4.3** - LMS
- **MariaDB 10.6** - Base de datos

---

## Variables de Entorno

### Backend (.env)

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `MOODLE_URL` | URL del servidor Moodle | `http://localhost:8080` |
| `MOODLE_TOKEN` | Token de servicio web | `abc123...` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `xxx.apps.googleusercontent.com` |
| `JWT_SECRET` | Secreto para firmar tokens | `mi-secreto-seguro` |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `JWT_EXPIRATION_MINUTES` | Duracion del access token | `60` |
| `DEBUG` | Modo desarrollo | `true` |

### Mobile (config.ts)

| Variable | Descripcion |
|----------|-------------|
| `API_URL` | URL del backend API |

**URLs segun entorno:**
- Android Emulator: `http://10.0.2.2:8000`
- iOS Simulator: `http://localhost:8000`
- Dispositivo fisico: `http://<ip-local>:8000`

---

## Licencia

Proyecto academico - Programacion de Dispositivos Moviles 2025
