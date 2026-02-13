# Guia de Configuracion de Moodle

Esta guia detalla como configurar Moodle para que funcione con la aplicacion movil.

---

## 1. Levantar Moodle con Docker

```powershell
cd docker
docker-compose up -d
```

Espera 2-3 minutos para que Moodle se inicialice completamente.

**Credenciales por defecto:**

| Campo | Valor |
|-------|-------|
| URL | http://localhost:8080 |
| Usuario | admin |
| Contrasena | Admin123! |

---

## 2. Habilitar Servicios Web

1. Inicia sesion como administrador
2. Ve a **Administracion del sitio** (menu lateral)
3. Navega a **Servidor > Servicios web > Vista general**

### 2.1 Habilitar servicios web

1. Click en "Habilitar servicios web"
2. Marca la casilla **Si**
3. Guarda cambios

### 2.2 Habilitar protocolo REST

1. Click en "Habilitar protocolos"
2. Activa el ojo en **REST**

---

## 3. Crear Servicio Externo

1. Ve a **Administracion del sitio > Servidor > Servicios web > Servicios externos**
2. Click en **Agregar**
3. Completa el formulario:

| Campo | Valor |
|-------|-------|
| Nombre | mobile_app |
| Nombre corto | mobileapp |
| Habilitado | Si |
| Solo usuarios autorizados | No |

4. Guarda cambios

### 3.1 Agregar funciones al servicio

Click en **Funciones** junto al servicio creado y agrega:

**Funciones requeridas:**

```
core_webservice_get_site_info
core_user_get_users
core_enrol_get_users_courses
core_course_get_contents
mod_assign_get_assignments
mod_assign_get_submission_status
mod_assign_save_submission
mod_forum_get_forums_by_courses
mod_forum_get_forum_discussions
mod_forum_get_discussion_posts
mod_forum_add_discussion_post
```

Para cada funcion:

1. Busca el nombre en el campo de busqueda
2. Selecciona la funcion
3. Click en **Agregar funciones**

---

## 4. Crear Token de Servicio

1. Ve a **Administracion del sitio > Servidor > Servicios web > Gestionar tokens**
2. Click en **Crear token**
3. Completa:

| Campo | Valor |
|-------|-------|
| Usuario | Admin User |
| Servicio | mobile_app |
| Validez | Sin fecha de caducidad (o la que prefieras) |

4. Guarda y **COPIA EL TOKEN**

El token se muestra solo una vez. Guardalo en el archivo `.env` del backend.

---

## 5. Crear Datos de Prueba

### 5.1 Crear un curso

1. Ve a **Administracion del sitio > Cursos > Agregar nuevo curso**
2. Completa:

| Campo | Valor |
|-------|-------|
| Nombre completo | Programacion Movil 2025 |
| Nombre corto | PM2025 |
| Categoria | Miscelanea |
| Visible | Mostrar |

3. Guarda y ver

### 5.2 Crear un usuario estudiante

1. Ve a **Administracion del sitio > Usuarios > Agregar nuevo usuario**
2. Completa:

| Campo | Valor |
|-------|-------|
| Usuario | estudiante |
| Contrasena | Estudiante123! |
| Nombre | Estudiante |
| Apellido | De Prueba |
| Email | estudiante@test.com |

3. Crea el usuario

### 5.3 Matricular usuario en el curso

1. Ve al curso creado
2. Click en **Participantes** (menu lateral)
3. Click en **Matricular usuarios**
4. Busca "Estudiante De Prueba"
5. Selecciona rol **Estudiante**
6. Click en **Matricular usuarios**

### 5.4 Crear una tarea

1. Dentro del curso, activa **Modo edicion**
2. En una seccion, click en **Agregar actividad o recurso**
3. Selecciona **Tarea**
4. Completa:

| Campo | Valor |
|-------|-------|
| Nombre | Tarea 1: Hola Mundo |
| Descripcion | Crea tu primera aplicacion movil |
| Fecha de entrega | (una fecha futura) |
| Tipos de entrega | Texto en linea |

5. Guarda

### 5.5 Crear un foro

1. Click en **Agregar actividad o recurso**
2. Selecciona **Foro**
3. Completa:

| Campo | Valor |
|-------|-------|
| Nombre | Foro de Dudas |
| Descripcion | Espacio para resolver dudas |
| Tipo de foro | Foro estandar |

4. Guarda

### 5.6 Crear una discusion en el foro

1. Entra al foro creado
2. Click en **Agregar un nuevo tema de discusion**
3. Completa:

| Campo | Valor |
|-------|-------|
| Asunto | Bienvenidos al curso |
| Mensaje | Este es el foro para dudas... |

4. Envia

---

## 6. Verificar Configuracion

### 6.1 Probar token manualmente

```bash
curl "http://localhost:8080/webservice/rest/server.php?wstoken=TU_TOKEN&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"
```

Deberia retornar informacion del sitio en JSON.

### 6.2 Probar desde el backend

1. Configura el archivo `.env` del backend:

```env
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=<tu_token_copiado>
DEBUG=true
```

2. Inicia el backend:

```powershell
cd backend
uvicorn app.main:app --reload
```

3. Visita http://localhost:8000/auth/moodle-status

Deberia mostrar:

```json
{
  "connected": true,
  "site_name": "Moodle Dev - Programacion Movil"
}
```

---

## Troubleshooting

### Error: "Web services are not enabled"

- Verificar que los servicios web estan habilitados
- Verificar que el protocolo REST esta activo

### Error: "Invalid token"

- Verificar que el token esta correctamente copiado
- Verificar que el token no ha expirado
- Verificar que el servicio tiene las funciones necesarias

### Error: "Access denied"

- Verificar permisos del usuario asociado al token
- Verificar que las funciones estan agregadas al servicio

### Error: "Function not available"

- La funcion no esta agregada al servicio externo
- Agregar la funcion faltante en Servicios externos > Funciones

---

## Puertos Utilizados

| Servicio | Puerto |
|----------|--------|
| Moodle Web | 8080 |
| Moodle HTTPS | 8443 |
| MariaDB | 3306 |
| Backend API | 8000 |
