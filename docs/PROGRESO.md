# Registro de Progreso del Proyecto

## Ciclos de Desarrollo

---

## Ciclo 1: Configuracion Inicial (Completado)

**Fecha:** 2025-02-02

### Objetivos

- [x] Crear estructura Docker para Moodle
- [x] Crear estructura del backend FastAPI
- [x] Crear proyecto React Native con Expo
- [x] Configurar variables de entorno

### Archivos Creados

#### Docker

| Archivo | Descripcion |
|---------|-------------|
| `docker/docker-compose.yml` | Moodle 4.3 + MariaDB 10.6 |
| `docker/setup-moodle.ps1` | Script PowerShell para inicializacion |
| `docker/.gitignore` | Ignora datos persistentes |

#### Backend (FastAPI)

| Archivo | Descripcion |
|---------|-------------|
| `backend/app/main.py` | Entry point con CORS y routers |
| `backend/app/config.py` | Configuracion con pydantic-settings |
| `backend/app/routers/auth.py` | Endpoints de autenticacion |
| `backend/app/routers/courses.py` | Endpoints de cursos |
| `backend/app/routers/assignments.py` | Endpoints de tareas |
| `backend/app/routers/forums.py` | Endpoints de foros |
| `backend/app/services/moodle_client.py` | Cliente HTTP para Moodle API |
| `backend/app/services/oauth_service.py` | Verificacion de tokens Google |
| `backend/app/utils/security.py` | JWT tokens |
| `backend/requirements.txt` | Dependencias Python |
| `backend/.env.example` | Plantilla de variables de entorno |

#### Mobile (React Native)

| Archivo | Descripcion |
|---------|-------------|
| `mobile/App.tsx` | Entry point |
| `mobile/app.json` | Configuracion Expo |
| `mobile/package.json` | Dependencias npm |
| `mobile/tsconfig.json` | Configuracion TypeScript |
| `mobile/src/navigation/RootNavigator.tsx` | Navegacion principal |
| `mobile/src/screens/WelcomeScreen.tsx` | Pantalla de bienvenida |
| `mobile/src/screens/LoginScreen.tsx` | Pantalla de login |
| `mobile/src/screens/HomeScreen.tsx` | Lista de cursos |
| `mobile/src/screens/CourseDetailScreen.tsx` | Detalle de curso |
| `mobile/src/api/config.ts` | Configuracion Axios |
| `mobile/src/api/authService.ts` | Servicio de autenticacion |
| `mobile/src/api/coursesService.ts` | Servicio de cursos |
| `mobile/src/store/authStore.ts` | Estado global con Zustand |

---

## Ciclo 2: Autenticacion OAuth 2.0 (Completado)

**Fecha:** 2025-02-02

### Objetivos

- [x] Implementar endpoint de desarrollo para login sin Google
- [x] Mejorar servicio OAuth en backend
- [x] Configurar Google Sign-In en React Native
- [x] Mejorar pantalla de Login con manejo de errores
- [x] Implementar refresh token y renovacion automatica

### Nuevos Endpoints Backend

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/auth/dev-login` | Login sin Google (solo modo debug) |
| POST | `/auth/refresh` | Renovar access token con refresh token |
| GET | `/auth/moodle-status` | Verificar conexion con Moodle |

### Cambios en Backend

#### `backend/app/routers/auth.py`

- Agregado `DevLoginRequest` schema
- Agregado `RefreshTokenRequest` schema
- Agregado `MoodleStatusResponse` schema
- Nuevo endpoint `POST /auth/dev-login` para desarrollo
- Nuevo endpoint `POST /auth/refresh` para renovar tokens
- Nuevo endpoint `GET /auth/moodle-status` para diagnostico
- Helper `_create_auth_response()` para crear respuestas de auth

#### `backend/app/utils/security.py`

- Nueva funcion `create_refresh_token()` con expiracion de 7 dias
- Nueva funcion `decode_refresh_token()` que retorna None si invalido
- Tokens ahora incluyen campo `type` ("access" o "refresh")
- Validacion de tipo de token en `decode_access_token()`

### Cambios en Mobile

#### `mobile/src/services/googleAuth.ts` (Nuevo)

- Servicio completo para Google Sign-In
- Manejo de errores especificos (cancelado, en progreso, sin Play Services)
- Funciones: `signIn()`, `signOut()`, `isSignedIn()`, `getCurrentUser()`

#### `mobile/src/api/authService.ts`

- Nueva funcion `refreshToken()`
- Nueva funcion `checkMoodleStatus()`
- Mejores mensajes de error segun codigo HTTP
- Manejo de error de red (`ERR_NETWORK`)

#### `mobile/src/api/config.ts`

- Interceptor de respuesta con auto-refresh de tokens
- Cola de peticiones pendientes durante refresh
- Limpieza automatica de tokens en caso de fallo

#### `mobile/src/store/authStore.ts`

- Nuevo campo `refreshToken` en el estado
- Nueva funcion `refreshAccessToken()`
- Almacenamiento de refresh token en SecureStore
- Intento de refresh al cargar auth almacenado
- Selector hooks: `useUser()`, `useIsAuthenticated()`, `useIsAuthLoading()`

#### `mobile/src/screens/LoginScreen.tsx`

- Indicador de estado de conexion con Moodle
- Verificacion de conexion al montar componente
- Boton de Google deshabilitado si no hay conexion
- Separador visual entre botones
- Boton de reintentar conexion
- Loading indicators separados por tipo de login

### Flujo de Autenticacion

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE LOGIN                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuario abre la app                                     │
│     └─> WelcomeScreen carga auth almacenado                 │
│         └─> Si existe, intenta refresh en background        │
│                                                             │
│  2. Usuario toca "Iniciar Sesion"                          │
│     └─> LoginScreen verifica conexion con Moodle           │
│                                                             │
│  3. Usuario toca "Continuar con Google"                    │
│     └─> Google Sign-In obtiene idToken                     │
│     └─> Backend valida token con Google                    │
│     └─> Backend busca usuario en Moodle                    │
│     └─> Backend genera access_token + refresh_token        │
│     └─> App guarda tokens en SecureStore                   │
│     └─> App navega a HomeScreen                            │
│                                                             │
│  4. Peticion con token expirado                            │
│     └─> Interceptor detecta 401                            │
│     └─> Interceptor usa refresh_token                      │
│     └─> Si exito: reintenta peticion original              │
│     └─> Si fallo: limpia tokens y logout                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tokens JWT

| Tipo | Duracion | Uso |
|------|----------|-----|
| Access Token | 60 minutos | Autenticar peticiones API |
| Refresh Token | 7 dias | Renovar access token |

**Estructura del token:**

```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "fullname": "Nombre Completo",
  "type": "access|refresh",
  "exp": 1234567890
}
```

---

## Ciclo 3: Modulo de Cursos (Pendiente)

### Objetivos

- [ ] Mejorar endpoint de cursos
- [ ] Implementar cache local con SQLite
- [ ] Agregar pull-to-refresh
- [ ] Implementar modo offline basico

---

## Ciclo 4: Modulo de Tareas (Pendiente)

### Objetivos

- [ ] Pantalla de lista de tareas
- [ ] Pantalla de detalle de tarea
- [ ] Formulario de envio de entrega
- [ ] Estados visuales de tareas

---

## Ciclo 5: Modulo de Foros (Pendiente)

### Objetivos

- [ ] Pantalla de lista de foros
- [ ] Pantalla de discusiones
- [ ] Pantalla de detalle con mensajes
- [ ] Formulario de respuesta

---

## Ciclo 6: Pulido UX (Pendiente)

### Objetivos

- [ ] Loading skeletons
- [ ] Empty states
- [ ] Manejo de errores visual
- [ ] Sincronizacion offline

---

## Ciclo 7: Testing y Documentacion (Pendiente)

### Objetivos

- [ ] Tests unitarios backend
- [ ] Tests de componentes mobile
- [ ] Documentacion de API (Swagger)
- [ ] README final
