import httpx
from typing import Any


class MoodleClient:
    """Cliente HTTP para comunicarse con la API REST de Moodle."""

    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.webservice_url = f"{self.base_url}/webservice/rest/server.php"

    async def _call(self, function: str, **params) -> Any:
        """Realiza una llamada a la API de Moodle."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            data = {
                "wstoken": self.token,
                "wsfunction": function,
                "moodlewsrestformat": "json",
                **params,
            }
            response = await client.post(self.webservice_url, data=data)
            response.raise_for_status()
            result = response.json()

            # Moodle retorna errores en el body
            if isinstance(result, dict) and "exception" in result:
                raise Exception(f"Moodle error: {result.get('message', 'Unknown error')}")

            return result

    # ==================== Usuarios ====================

    async def get_site_info(self) -> dict:
        """Obtiene información del sitio y del usuario actual."""
        return await self._call("core_webservice_get_site_info")

    async def get_user_by_email(self, email: str) -> dict | None:
        """Busca un usuario por email."""
        try:
            result = await self._call(
                "core_user_get_users", criteria=[{"key": "email", "value": email}]
            )
            users = result.get("users", [])
            return users[0] if users else None
        except Exception:
            return None

    # ==================== Cursos ====================

    async def get_user_courses(self, user_id: int) -> list:
        """Obtiene los cursos de un usuario."""
        return await self._call("core_enrol_get_users_courses", userid=user_id)

    async def get_course_contents(self, course_id: int) -> list:
        """Obtiene el contenido de un curso (secciones y módulos)."""
        return await self._call("core_course_get_contents", courseid=course_id)

    # ==================== Tareas (Assignments) ====================

    async def get_assignments(self, course_id: int) -> list:
        """Obtiene las tareas de un curso."""
        result = await self._call("mod_assign_get_assignments", courseids=[course_id])
        courses = result.get("courses", [])
        if courses:
            return courses[0].get("assignments", [])
        return []

    async def get_assignment_by_id(self, assignment_id: int) -> dict | None:
        """Obtiene una tarea por ID."""
        # Moodle no tiene un endpoint directo, hay que buscar en todos los cursos
        # Por simplicidad, usamos get_assignments con el course_id del cache
        # En producción, esto debería optimizarse
        return None  # TODO: Implementar búsqueda por ID

    async def get_submission_status(self, assignment_id: int, user_id: int) -> dict:
        """Obtiene el estado de la entrega de un usuario."""
        try:
            result = await self._call(
                "mod_assign_get_submission_status",
                assignid=assignment_id,
                userid=user_id,
            )
            submission = result.get("lastattempt", {}).get("submission", {})
            grade_info = result.get("feedback", {})

            return {
                "status": submission.get("status", "new"),
                "graded": grade_info.get("grade") is not None,
                "grade": grade_info.get("gradefordisplay"),
                "feedback": grade_info.get("feedbackplugins", [{}])[0].get("editorfields", [{}])[0].get("text"),
            }
        except Exception:
            return {"status": "new", "graded": False}

    async def submit_assignment(
        self, assignment_id: int, user_id: int, text: str
    ) -> bool:
        """Envía una entrega de texto para una tarea."""
        try:
            # Guardar el texto como borrador
            await self._call(
                "mod_assign_save_submission",
                assignmentid=assignment_id,
                plugindata={"onlinetext_editor": {"text": text, "format": 1, "itemid": 0}},
            )
            return True
        except Exception:
            return False

    # ==================== Foros ====================

    async def get_forums(self, course_id: int) -> list:
        """Obtiene los foros de un curso."""
        return await self._call("mod_forum_get_forums_by_courses", courseids=[course_id])

    async def get_forum_discussions(self, forum_id: int) -> list:
        """Obtiene las discusiones de un foro."""
        result = await self._call("mod_forum_get_forum_discussions", forumid=forum_id)
        return result.get("discussions", [])

    async def get_discussion_posts(self, discussion_id: int) -> list:
        """Obtiene los mensajes de una discusión."""
        result = await self._call(
            "mod_forum_get_discussion_posts", discussionid=discussion_id
        )
        return result.get("posts", [])

    async def add_discussion_post(self, post_id: int, message: str) -> dict | None:
        """Añade una respuesta a un post."""
        try:
            result = await self._call(
                "mod_forum_add_discussion_post",
                postid=post_id,
                subject="Re:",
                message=message,
            )
            return result
        except Exception:
            return None
