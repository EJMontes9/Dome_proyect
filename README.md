# Moodle Mobile - Aplicacion Cliente

Aplicacion movil cliente para Moodle desarrollada con React Native (Expo) y FastAPI como intermediario. El proyecto levanta un entorno completo de Moodle con Docker para desarrollo local.

## Arquitectura del Proyecto

```
Usuario (movil)  -->  FastAPI (backend)  -->  Moodle (Docker)
     :8000                                    :8080
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
docker-compose --version  # Docker Compose version 2.x o superior
python --version          # Python 3.11 o superior
node --version            # v18.x o superior
npm --version             # 9.x o superior
git --version             # git version 2.x
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

### 2.1 Iniciar los contenedores

```bash
cd docker
docker-compose up -d
```

### 2.2 Verificar que los contenedores estan corriendo

```bash
docker ps
```

Deberias ver dos contenedores activos:

| Contenedor | Puerto | Estado esperado |
|-----------|--------|----------------|
| `moodle-app` | 8080, 8443 | Up (healthy) |
| `moodle-db` | 3306 | Up (healthy) |

### 2.3 Esperar a que Moodle este listo

La primera vez, Moodle tarda **entre 3 y 5 minutos** en inicializarse completamente. Puedes monitorear el progreso con:

```bash
docker logs -f moodle-app
```

Espera hasta ver un mensaje como `moodle setup finished!` o similar. Luego accede a:

- **URL:** http://localhost:8080
- **Usuario:** `admin`
- **Contrasena:** `Admin123!`

### 2.4 Detener los contenedores (cuando ya no los necesites)

```bash
cd docker
docker-compose down
```

> **Nota:** Los datos se persisten en `docker/mariadb/data` y `docker/moodle/data`, asi que al volver a levantar los contenedores no perderas la configuracion.

---

## Paso 3: Configurar Moodle (Servicios Web)

Para que el backend pueda comunicarse con Moodle, necesitas habilitar los servicios web REST y generar un token.

### 3.1 Habilitar servicios web

1. Inicia sesion en Moodle (http://localhost:8080) como `admin` / `Admin123!`
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
mod_assign_get_assignments
mod_assign_save_submission
mod_forum_get_forum_discussions
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
python -m venv venv
.\venv\Scripts\Activate
```

### 4.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4.3 Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `backend/.env` con los valores reales:

```env
# URL de Moodle (debe coincidir con el puerto del contenedor Docker)
MOODLE_URL=http://localhost:8080

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

> **Nota sobre Google OAuth:** Para obtener el `GOOGLE_CLIENT_ID`, ve a [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto, habilita la API de Google Sign-In y crea credenciales OAuth 2.0 de tipo "ID de cliente de aplicacion web". Agrega `http://localhost:8000` como origen autorizado.

### 4.4 Iniciar el servidor

```bash
uvicorn app.main:app --reload
```

### 4.5 Verificar que el backend funciona

- **Documentacion interactiva (Swagger):** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

En la pagina de Swagger podras probar todos los endpoints directamente desde el navegador.

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
// Para emulador Android: usa http://10.0.2.2:8000
// Para dispositivo fisico: usa la IP de tu maquina (ej: http://192.168.1.100:8000)
// Para emulador iOS o web: usa http://localhost:8000
export const API_URL = 'http://TU_IP_LOCAL:8000';
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
3. Tras iniciar sesion, veras la **lista de cursos** del usuario

---

## Resumen: Orden para Levantar Todo

Sigue este orden cada vez que quieras trabajar con el proyecto:

```
1. Docker (Moodle + MariaDB)
   cd docker && docker-compose up -d

2. Backend (FastAPI)
   cd backend && source venv/bin/activate && uvicorn app.main:app --reload

3. Mobile (Expo)
   cd mobile && npx expo start
```

### Puertos utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Moodle | 8080 | http://localhost:8080 |
| Moodle HTTPS | 8443 | https://localhost:8443 |
| MariaDB | 3306 | - |
| Backend FastAPI | 8000 | http://localhost:8000 |
| Swagger (docs API) | 8000 | http://localhost:8000/docs |

---

## Endpoints del API

### Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/auth/google` | Login con token de Google OAuth |
| `GET` | `/auth/me` | Obtener info del usuario autenticado |

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

### Moodle no carga en localhost:8080

- Verifica que los contenedores estan corriendo: `docker ps`
- Revisa los logs: `docker logs moodle-app`
- Asegurate de esperar 3-5 minutos en la primera ejecucion
- Verifica que el puerto 8080 no este ocupado por otro servicio: `lsof -i :8080` (Linux/macOS) o `netstat -ano | findstr :8080` (Windows)

### Error de conexion del backend a Moodle

- Verifica que `MOODLE_URL` en `.env` sea `http://localhost:8080`
- Verifica que el token en `.env` sea correcto
- Comprueba que los servicios web estan habilitados en Moodle (Paso 3)

### La app movil no se conecta al backend

- Si usas dispositivo fisico, cambia `localhost` por tu IP local en `mobile/src/api/config.ts`
- Si usas emulador Android, usa `http://10.0.2.2:8000` como URL del backend
- Verifica que tu telefono y tu PC estan en la misma red WiFi
- Verifica que el backend esta corriendo en el puerto 8000

### Error al instalar dependencias de Python

- Asegurate de usar Python 3.11 o superior: `python --version`
- En algunos sistemas necesitas instalar `python3-venv`: `sudo apt install python3-venv`
- Si hay errores con `bcrypt`, instala las dependencias de compilacion: `sudo apt install build-essential libffi-dev`

### Error al instalar dependencias de Node.js

- Asegurate de usar Node.js 18 o superior: `node --version`
- Borra `node_modules` y reinstala: `rm -rf node_modules && npm install`
- Si hay problemas con el cache: `npm cache clean --force`

### Docker ocupa mucho espacio

- Para limpiar datos y empezar desde cero:
  ```bash
  cd docker
  docker-compose down -v
  rm -rf mariadb/data moodle/data moodle/moodledata
  docker-compose up -d
  ```

---

## Tecnologias

| Capa | Tecnologia |
|------|-----------|
| **Frontend movil** | React Native 0.73 + Expo 50 + TypeScript |
| **Navegacion** | React Navigation 6 |
| **Estado** | Zustand |
| **HTTP Client** | Axios |
| **Backend API** | Python 3.11 + FastAPI |
| **Autenticacion** | Google OAuth 2.0 + JWT |
| **Base de datos** | MariaDB 10.6 (via Moodle) |
| **LMS** | Moodle 4.3 (Bitnami Docker) |

---

## Licencia

Proyecto academico - Programacion de Dispositivos Moviles
