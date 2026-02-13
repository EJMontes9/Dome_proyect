# Moodle Mobile - Aplicacion Cliente

Aplicacion movil cliente para Moodle desarrollada con React Native (Expo) y FastAPI como intermediario. El proyecto levanta un entorno completo de Moodle con Docker para desarrollo local.

## Arquitectura del Proyecto

```
Usuario (movil)  -->  FastAPI (backend)  -->  Moodle (Docker)
     :8001                                    :8090
                                               |
                                           MariaDB
                                            :3306
```

```
Dome_proyect/
├── docker/          # Infraestructura Docker (Moodle + MariaDB)
├── backend/         # API intermediaria (FastAPI + Python)
├── mobile/          # App movil (React Native + Expo + TypeScript)
└── docs/            # Documentacion adicional
```

---

## Requisitos Previos

Antes de empezar, asegurate de tener instalado lo siguiente:

| Herramienta | Version minima | Descarga |
|-------------|---------------|----------|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |
| Python | 3.11+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Git | 2.x | https://git-scm.com/ |

> **Nota para movil:** Necesitaras la app **Expo Go** en tu telefono (disponible en App Store / Google Play) o un emulador Android/iOS configurado.

### Verificar instalacion

Ejecuta estos comandos para confirmar que todo esta listo:

```bash
docker --version          # Docker version 24.x o superior
docker compose version    # Docker Compose version 2.x o superior
node --version            # v18.x o superior
npm --version             # 9.x o superior
git --version             # git version 2.x
```

Para verificar Python:

```bash
# Linux / macOS
python3 --version         # Python 3.11 o superior

# Windows (si 'python --version' no funciona, usa el launcher)
py --version              # Python 3.11 o superior
```

---

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/EJMontes9/Dome_proyect.git
cd Dome_proyect
```

---

## Paso 2: Levantar Moodle con Docker

Este paso levanta dos contenedores: **MariaDB** (base de datos) y **Moodle** (plataforma LMS).

> **Nota importante:** La imagen Docker oficial `bitnami/moodle` fue migrada a Bitnami Secure Images y ya no esta disponible en Docker Hub. Este proyecto usa `bitnamilegacy/moodle:4.3` como reemplazo compatible.

### 2.1 Iniciar los contenedores

```bash
cd docker
docker compose up -d
```

### 2.2 Verificar que los contenedores estan corriendo

```bash
docker ps
```

Deberias ver dos contenedores activos:

| Contenedor | Puerto | Estado esperado |
|-----------|--------|----------------|
| `moodle-app` | 8090, 8453 | Up |
| `moodle-db` | 3307 | Up (healthy) |

### 2.3 Esperar a que Moodle este listo

La primera vez, Moodle tarda **entre 5 y 15 minutos** en inicializarse completamente. Puedes monitorear el progreso con:

```bash
docker logs -f moodle-app
```

Espera hasta ver el mensaje `** Moodle setup finished! **`. Luego accede a:

- **URL:** http://localhost:8090
- **Usuario:** `admin`
- **Contrasena:** `Admin123!`

### 2.4 Detener los contenedores (cuando ya no los necesites)

```bash
cd docker
docker compose down
```

> **Nota:** Los datos se persisten en volumenes Docker, asi que al volver a levantar los contenedores no perderas la configuracion.

---

## Paso 3: Configurar Moodle (Servicios Web)

Para que el backend pueda comunicarse con Moodle, necesitas habilitar los servicios web REST y generar un token.

### 3.1 Habilitar servicios web

1. Inicia sesion en Moodle (http://localhost:8090) como `admin` / `Admin123!`
2. Ve a **Administracion del sitio** > **Servidor** > **Servicios web** > **Vista general**
3. Habilita los servicios web haciendo clic en **Habilitar servicios web** y marcando la casilla
4. Habilita el protocolo **REST**:
   - Ve a **Administracion del sitio** > **Servidor** > **Servicios web** > **Administrar protocolos**
   - Activa el icono del ojo junto a **REST**

### 3.2 Crear un servicio externo

1. Ve a **Administracion del sitio** > **Servidor** > **Servicios web** > **Servicios externos**
2. Haz clic en **Agregar**
3. Llena los campos:
   - **Nombre:** `Mobile App Service`
   - **Nombre corto:** `mobileapp`
   - **Habilitado:** Si
   - **Usuarios autorizados:** Si (o "Solo usuarios autorizados")
4. Guarda los cambios
5. Haz clic en **Funciones** del servicio recien creado y agrega las siguientes funciones:

```
core_webservice_get_site_info
core_enrol_get_users_courses
core_course_get_contents
core_user_get_users
mod_assign_get_assignments
mod_assign_get_submission_status
mod_assign_save_submission
mod_forum_get_forums_by_courses
mod_forum_get_forum_discussions
mod_forum_get_discussion_posts
mod_forum_add_discussion_post
```

### 3.3 Generar un token

1. Ve a **Administracion del sitio** > **Servidor** > **Servicios web** > **Administrar tokens**
2. Haz clic en **Crear token**
3. Selecciona el usuario **admin** y el servicio **Mobile App Service**
4. Guarda y **copia el token generado** (lo necesitaras en el siguiente paso)

### 3.4 Crear datos de prueba (opcional pero recomendado)

Para probar la aplicacion completa, crea al menos:

1. **Un curso:** Administracion del sitio > Cursos > Administrar cursos y categorias > Crear un curso nuevo
2. **Un usuario estudiante:** Administracion del sitio > Usuarios > Cuentas > Agregar un usuario
3. **Matricula:** Entra al curso > Participantes > Matricular usuarios (agrega al estudiante)
4. **Una tarea:** Dentro del curso > Activar edicion > Agregar actividad > Tarea
5. **Un foro:** Dentro del curso > Activar edicion > Agregar actividad > Foro

---

## Paso 4: Levantar el Backend (FastAPI)

### 4.1 Crear entorno virtual de Python

**Linux / macOS:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate
```

### 4.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4.3 Configurar variables de entorno

**Linux / macOS:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

Edita el archivo `backend/.env` con los valores reales:

```env
# URL de Moodle (debe coincidir con el puerto del contenedor Docker)
MOODLE_URL=http://localhost:8090

# Token generado en el Paso 3.3
MOODLE_TOKEN=PEGA_AQUI_TU_TOKEN_DE_MOODLE

# Google OAuth - Client ID (obtenido de Google Cloud Console)
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com

# JWT - Cambia el secreto por uno seguro
JWT_SECRET=cambia_esto_por_un_secreto_seguro
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# Modo debug
DEBUG=true
```

> **Nota sobre Google OAuth:** Para obtener el `GOOGLE_CLIENT_ID`, ve a [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto, habilita la API de Google Sign-In y crea credenciales OAuth 2.0 de tipo "ID de cliente de aplicacion web".

### 4.4 Iniciar el servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 4.5 Verificar que el backend funciona

- **Documentacion interactiva (Swagger):** http://localhost:8001/docs
- **Estado de Moodle:** http://localhost:8001/auth/moodle-status

---

## Paso 5: Levantar la App Movil (React Native / Expo)

### 5.1 Instalar dependencias

```bash
cd mobile
npm install
```

### 5.2 Configurar la URL del backend

Si estas usando un dispositivo fisico (Expo Go), necesitas cambiar la URL del backend para que apunte a la IP de tu maquina en lugar de `localhost`.

Edita el archivo `mobile/src/api/config.ts`:

```typescript
// Para emulador Android: usa http://10.0.2.2:8001
// Para dispositivo fisico: usa la IP de tu maquina (ej: http://192.168.1.100:8001)
// Para emulador iOS o web: usa http://localhost:8001
export const API_URL = 'http://TU_IP_LOCAL:8001';
```

Para encontrar tu IP local:

```bash
# Linux / macOS
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### 5.3 Iniciar la app

```bash
npx expo start
```

Opciones disponibles despues de iniciar:

| Tecla | Accion |
|-------|--------|
| `a` | Abrir en emulador Android |
| `i` | Abrir en simulador iOS (solo macOS) |
| `w` | Abrir en navegador web |
| Escanear QR | Abrir en Expo Go (dispositivo fisico) |

### 5.4 Verificar que la app funciona

1. La app deberia mostrar la **pantalla de bienvenida** (WelcomeScreen)
2. Al presionar continuar, veras la **pantalla de login** con Google Sign-In
3. En modo desarrollo, puedes usar **"Entrar como Administrador (Dev)"**
4. Tras iniciar sesion, veras la **lista de cursos** del usuario

---

## Resumen: Orden para Levantar Todo

**Windows (PowerShell):**

```powershell
# 1. Docker (Moodle + MariaDB)
cd docker; docker compose up -d

# 2. Backend (FastAPI)
cd backend; .\venv\Scripts\Activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 3. Mobile (Expo)
cd mobile; npx expo start
```

**Linux / macOS:**

```bash
# 1. Docker (Moodle + MariaDB)
cd docker && docker compose up -d

# 2. Backend (FastAPI)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 3. Mobile (Expo)
cd mobile && npx expo start
```

### Puertos utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Moodle | 8090 | http://localhost:8090 |
| Moodle HTTPS | 8453 | https://localhost:8453 |
| MariaDB | 3307 | - |
| Backend FastAPI | 8001 | http://localhost:8001 |
| Swagger (docs API) | 8001 | http://localhost:8001/docs |

---

## Endpoints del API

### Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/auth/google` | Login con token de Google OAuth |
| `POST` | `/auth/dev-login` | Login de desarrollo (solo debug) |
| `POST` | `/auth/refresh` | Renovar access token |
| `GET` | `/auth/me` | Obtener info del usuario autenticado |
| `GET` | `/auth/moodle-status` | Estado de conexion con Moodle |

### Cursos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/courses` | Listar cursos del usuario |
| `GET` | `/courses/{id}` | Detalle de un curso |
| `GET` | `/courses/{id}/contents` | Contenido y secciones del curso |

### Tareas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/assignments/course/{id}` | Listar tareas de un curso |
| `GET` | `/assignments/{id}` | Detalle de una tarea |
| `GET` | `/assignments/{id}/submission` | Estado de entrega |
| `POST` | `/assignments/{id}/submit` | Enviar una tarea |

### Foros

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/forums/course/{id}` | Listar foros de un curso |
| `GET` | `/forums/{id}/discussions` | Listar discusiones de un foro |
| `GET` | `/forums/discussions/{id}/posts` | Ver posts de una discusion |
| `POST` | `/forums/discussions/{id}/reply` | Responder a una discusion |

---

## Solucion de Problemas

### Moodle no carga en localhost:8090

- Verifica que los contenedores estan corriendo: `docker ps`
- Revisa los logs: `docker logs moodle-app`
- Asegurate de esperar 5-15 minutos en la primera ejecucion
- Verifica que el puerto 8090 no este ocupado: `netstat -ano | findstr :8090` (Windows) o `lsof -i :8090` (Linux/macOS)

### Error de conexion del backend a Moodle

- Verifica que `MOODLE_URL` en `.env` sea `http://localhost:8090`
- Verifica que el token en `.env` sea correcto
- Comprueba que los servicios web estan habilitados en Moodle (Paso 3)

### La app movil no se conecta al backend

- Si usas dispositivo fisico, cambia `localhost` por tu IP local en `mobile/src/api/config.ts`
- Si usas emulador Android, usa `http://10.0.2.2:8001` como URL del backend
- Verifica que tu telefono y tu PC estan en la misma red WiFi
- Verifica que el backend esta corriendo en el puerto 8001

### Error al instalar dependencias de Python

- Asegurate de usar Python 3.11 o superior: `py --version` (Windows) o `python3 --version` (Linux/macOS)
- En Windows, si `python` no funciona, usa `py` (el Python Launcher)

### Docker ocupa mucho espacio

- Para limpiar datos y empezar desde cero:

  ```bash
  cd docker
  docker compose down -v
  docker compose up -d
  ```

  El flag `-v` elimina los volumenes Docker con todos los datos de Moodle y MariaDB.

---

## Tecnologias

| Capa | Tecnologia |
|------|-----------|
| **Frontend movil** | React Native + Expo + TypeScript |
| **Navegacion** | React Navigation 6 |
| **Estado** | Zustand |
| **HTTP Client** | Axios |
| **Backend API** | Python 3.11+ + FastAPI |
| **Autenticacion** | Google OAuth 2.0 + JWT |
| **Base de datos** | MariaDB 10.6 (via Moodle) |
| **LMS** | Moodle 4.3 (Bitnami Legacy Docker) |

---

## Licencia

Proyecto academico - Programacion de Dispositivos Moviles 2025
