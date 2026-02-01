from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from ..services.moodle_client import MoodleClient
from ..utils.security import get_current_user
from ..config import get_settings

router = APIRouter(prefix="/assignments", tags=["Tareas"])


class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    name: str
    intro: str | None = None
    duedate: int | None = None
    allowsubmissionsfromdate: int | None = None
    grade: int | None = None


class SubmissionStatusResponse(BaseModel):
    status: str
    graded: bool
    grade: str | None = None
    feedback: str | None = None


class SubmitAssignmentRequest(BaseModel):
    text: str


class SubmitAssignmentResponse(BaseModel):
    success: bool
    message: str


@router.get("/course/{course_id}", response_model=List[AssignmentResponse])
async def get_course_assignments(
    course_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Lista todas las tareas de un curso.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    assignments = await moodle.get_assignments(course_id)

    return [
        AssignmentResponse(
            id=assignment["id"],
            course_id=assignment.get("course", course_id),
            name=assignment.get("name", ""),
            intro=assignment.get("intro"),
            duedate=assignment.get("duedate"),
            allowsubmissionsfromdate=assignment.get("allowsubmissionsfromdate"),
            grade=assignment.get("grade"),
        )
        for assignment in assignments
    ]


@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment_detail(
    assignment_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el detalle de una tarea específica.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    assignment = await moodle.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    return AssignmentResponse(
        id=assignment["id"],
        course_id=assignment.get("course", 0),
        name=assignment.get("name", ""),
        intro=assignment.get("intro"),
        duedate=assignment.get("duedate"),
        allowsubmissionsfromdate=assignment.get("allowsubmissionsfromdate"),
        grade=assignment.get("grade"),
    )


@router.get("/{assignment_id}/submission", response_model=SubmissionStatusResponse)
async def get_submission_status(
    assignment_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el estado de la entrega del usuario para una tarea.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    user_id = int(current_user["sub"])
    submission = await moodle.get_submission_status(assignment_id, user_id)

    return SubmissionStatusResponse(
        status=submission.get("status", "new"),
        graded=submission.get("graded", False),
        grade=submission.get("grade"),
        feedback=submission.get("feedback"),
    )


@router.post("/{assignment_id}/submit", response_model=SubmitAssignmentResponse)
async def submit_assignment(
    assignment_id: int,
    request: SubmitAssignmentRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Envía una entrega de tarea en formato texto.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    user_id = int(current_user["sub"])
    success = await moodle.submit_assignment(assignment_id, user_id, request.text)

    if not success:
        raise HTTPException(status_code=400, detail="Error al enviar la entrega")

    return SubmitAssignmentResponse(success=True, message="Entrega enviada exitosamente")
