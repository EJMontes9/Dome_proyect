# Moodle Mobile - Aplicacion Cliente

Aplicacion movil cliente para Moodle desarrollada con React Native y FastAPI.

## Estructura del Proyecto

```
Dome_proyect/
├── docker/          # Moodle en Docker para desarrollo
├── backend/         # API FastAPI
├── mobile/          # App React Native (Expo)
└── docs/            # Documentacion
```

## Requisitos

- Docker Desktop
- Python 3.11+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

## Inicio Rapido

### 1. Levantar Moodle (Docker)

```powershell
cd docker
docker-compose up -d
```

Espera 2-3 minutos. Accede a http://localhost:8080
- Usuario: `admin`
- Contrasena: `Admin123!`

### 2. Configurar Moodle

1. Ve a **Administracion del sitio > Plugins > Servicios web**
2. Habilita los servicios web
3. Habilita el protocolo REST
4. Crea un servicio externo con estas funciones:
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `core_course_get_contents`
   - `mod_assign_get_assignments`
   - `mod_assign_save_submission`
   - `mod_forum_get_forum_discussions`
   - `mod_forum_add_discussion_post`
5. Genera un token para el usuario admin
6. Crea un curso y un usuario de prueba

### 3. Configurar Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

Copia `.env.example` a `.env` y configura:
```
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=tu_token_aqui
```

Ejecuta el servidor:
```powershell
uvicorn app.main:app --reload
```

API disponible en http://localhost:8000/docs

### 4. Configurar Mobile

```powershell
cd mobile
npm install
npx expo start
```

Escanea el QR con Expo Go o usa un emulador.

## Desarrollo

### Backend (FastAPI)

| Endpoint | Descripcion |
|----------|-------------|
| `POST /auth/google` | Login con Google OAuth |
| `GET /courses` | Lista cursos del usuario |
| `GET /courses/{id}/contents` | Contenido del curso |
| `GET /assignments/course/{id}` | Tareas del curso |
| `POST /assignments/{id}/submit` | Enviar tarea |
| `GET /forums/course/{id}` | Foros del curso |

### Mobile (React Native)

| Pantalla | Descripcion |
|----------|-------------|
| WelcomeScreen | Pantalla de bienvenida |
| LoginScreen | Login con Google |
| HomeScreen | Lista de cursos |
| CourseDetailScreen | Contenido del curso |

## Tecnologias

- **Frontend:** React Native + Expo + TypeScript
- **Backend:** Python + FastAPI
- **Base de datos:** Moodle (MariaDB)
- **Autenticacion:** OAuth 2.0 + JWT

## Licencia

Proyecto academico - Programacion de Dispositivos Moviles
