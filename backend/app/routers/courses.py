from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from ..services.moodle_client import MoodleClient
from ..utils.security import get_current_user
from ..config import get_settings

router = APIRouter(prefix="/courses", tags=["Cursos"])


class CourseResponse(BaseModel):
    id: int
    shortname: str
    fullname: str
    summary: str | None = None
    startdate: int | None = None
    enddate: int | None = None


class CourseContentResponse(BaseModel):
    id: int
    name: str
    summary: str | None = None
    modules: List[dict] = []


@router.get("", response_model=List[CourseResponse])
async def get_user_courses(current_user: dict = Depends(get_current_user)):
    """
    Lista todos los cursos en los que el usuario está matriculado.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    user_id = int(current_user["sub"])
    courses = await moodle.get_user_courses(user_id)

    return [
        CourseResponse(
            id=course["id"],
            shortname=course.get("shortname", ""),
            fullname=course.get("fullname", ""),
            summary=course.get("summary"),
            startdate=course.get("startdate"),
            enddate=course.get("enddate"),
        )
        for course in courses
    ]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course_detail(
    course_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el detalle de un curso específico.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    user_id = int(current_user["sub"])
    courses = await moodle.get_user_courses(user_id)

    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    return CourseResponse(
        id=course["id"],
        shortname=course.get("shortname", ""),
        fullname=course.get("fullname", ""),
        summary=course.get("summary"),
        startdate=course.get("startdate"),
        enddate=course.get("enddate"),
    )


@router.get("/{course_id}/contents", response_model=List[CourseContentResponse])
async def get_course_contents(
    course_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el contenido (secciones y módulos) de un curso.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    contents = await moodle.get_course_contents(course_id)

    return [
        CourseContentResponse(
            id=section.get("id", 0),
            name=section.get("name", ""),
            summary=section.get("summary"),
            modules=section.get("modules", []),
        )
        for section in contents
    ]
