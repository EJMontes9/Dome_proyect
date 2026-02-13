# Documentacion de la API

Base URL: `http://localhost:8000`

Documentacion interactiva: `http://localhost:8000/docs`

---

## Autenticacion

Todos los endpoints (excepto los de auth) requieren un header `Authorization`:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### POST /auth/google

Inicia sesion con un token de Google OAuth.

**Request:**

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 2,
    "email": "estudiante@test.com",
    "fullname": "Estudiante de Prueba"
  }
}
```

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 401 | Token de Google invalido |
| 403 | Usuario no registrado en Moodle |

---

### POST /auth/dev-login

Login de desarrollo sin Google OAuth. Solo disponible cuando `DEBUG=true`.

**Request:**

```json
{
  "email": "estudiante@test.com"  // opcional
}
```

Si no se proporciona email, usa el usuario admin de Moodle.

**Response 200:** Igual que `/auth/google`

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 403 | Modo desarrollo no habilitado |
| 404 | Usuario no encontrado en Moodle |

---

### POST /auth/refresh

Renueva el access token usando el refresh token.

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:** Igual que `/auth/google`

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 401 | Refresh token invalido o expirado |

---

### GET /auth/me

Obtiene informacion del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**

```json
{
  "id": 2,
  "email": "estudiante@test.com",
  "fullname": "Estudiante de Prueba"
}
```

---

### GET /auth/moodle-status

Verifica la conexion con el servidor Moodle.

**Response 200 (conectado):**

```json
{
  "connected": true,
  "site_name": "Moodle Dev"
}
```

**Response 200 (desconectado):**

```json
{
  "connected": false,
  "error": "Connection refused"
}
```

---

### GET /courses

Lista los cursos del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**

```json
[
  {
    "id": 2,
    "shortname": "PM2025",
    "fullname": "Programacion Movil 2025",
    "summary": "<p>Curso de desarrollo movil</p>",
    "startdate": 1704067200,
    "enddate": 1735689600
  }
]
```

---

### GET /courses/{course_id}

Obtiene el detalle de un curso.

**Response 200:**

```json
{
  "id": 2,
  "shortname": "PM2025",
  "fullname": "Programacion Movil 2025",
  "summary": "<p>Curso de desarrollo movil</p>",
  "startdate": 1704067200,
  "enddate": 1735689600
}
```

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 404 | Curso no encontrado |

---

### GET /courses/{course_id}/contents

Obtiene el contenido (secciones y modulos) de un curso.

**Response 200:**

```json
[
  {
    "id": 1,
    "name": "Tema 1: Introduccion",
    "summary": "<p>Conceptos basicos</p>",
    "modules": [
      {
        "id": 1,
        "name": "Tarea 1",
        "instance": 1,
        "modname": "assign",
        "url": "http://localhost:8080/mod/assign/view.php?id=1"
      },
      {
        "id": 2,
        "name": "Foro General",
        "instance": 1,
        "modname": "forum",
        "url": "http://localhost:8080/mod/forum/view.php?id=2"
      }
    ]
  }
]
```

---

### GET /assignments/course/{course_id}

Lista las tareas de un curso.

**Response 200:**

```json
[
  {
    "id": 1,
    "course_id": 2,
    "name": "Tarea 1: Hola Mundo",
    "intro": "<p>Crea tu primera app</p>",
    "duedate": 1707264000,
    "allowsubmissionsfromdate": 1704672000,
    "grade": 100
  }
]
```

---

### GET /assignments/{assignment_id}

Obtiene el detalle de una tarea.

**Response 200:**

```json
{
  "id": 1,
  "course_id": 2,
  "name": "Tarea 1: Hola Mundo",
  "intro": "<p>Crea tu primera app</p>",
  "duedate": 1707264000,
  "allowsubmissionsfromdate": 1704672000,
  "grade": 100
}
```

---

### GET /assignments/{assignment_id}/submission

Obtiene el estado de entrega del usuario para una tarea.

**Response 200:**

```json
{
  "status": "submitted",
  "graded": true,
  "grade": "85",
  "feedback": "Buen trabajo!"
}
```

**Valores de status:**

| Status | Descripcion |
|--------|-------------|
| new | Sin entrega |
| draft | Borrador |
| submitted | Entregado |

---

### POST /assignments/{assignment_id}/submit

Envia una entrega de tarea en formato texto.

**Request:**

```json
{
  "text": "Mi solucion a la tarea..."
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Entrega enviada exitosamente"
}
```

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 400 | Error al enviar la entrega |

---

### GET /forums/course/{course_id}

Lista los foros de un curso.

**Response 200:**

```json
[
  {
    "id": 1,
    "course_id": 2,
    "name": "Foro de Dudas",
    "intro": "<p>Espacio para preguntas</p>",
    "type": "general"
  }
]
```

---

### GET /forums/{forum_id}/discussions

Lista las discusiones de un foro.

**Response 200:**

```json
[
  {
    "id": 1,
    "name": "Duda sobre tarea 1",
    "message": "<p>No entiendo el requisito...</p>",
    "userid": 3,
    "userfullname": "Juan Perez",
    "created": 1704672000,
    "modified": 1704758400,
    "numreplies": 5
  }
]
```

---

### GET /forums/discussions/{discussion_id}/posts

Obtiene los mensajes de una discusion.

**Response 200:**

```json
[
  {
    "id": 1,
    "discussion_id": 1,
    "parent_id": 0,
    "userid": 3,
    "userfullname": "Juan Perez",
    "message": "<p>No entiendo el requisito...</p>",
    "created": 1704672000
  },
  {
    "id": 2,
    "discussion_id": 1,
    "parent_id": 1,
    "userid": 2,
    "userfullname": "Profesor",
    "message": "<p>El requisito se refiere a...</p>",
    "created": 1704758400
  }
]
```

---

### POST /forums/discussions/{discussion_id}/reply

Publica una respuesta en una discusion.

**Request:**

```json
{
  "message": "Mi respuesta a la discusion..."
}
```

**Response 200:**

```json
{
  "success": true,
  "post_id": 3,
  "message": "Respuesta publicada"
}
```

**Errores:**

| Codigo | Descripcion |
|--------|-------------|
| 400 | Error al publicar respuesta |
| 404 | Discusion no encontrada |

---

## Codigos de Error Comunes

| Codigo | Descripcion |
|--------|-------------|
| 400 | Bad Request - Datos invalidos |
| 401 | Unauthorized - Token invalido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error |

---

## Formato de Errores

```json
{
  "detail": "Mensaje de error descriptivo"
}
```
