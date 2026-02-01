from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from ..services.moodle_client import MoodleClient
from ..utils.security import get_current_user
from ..config import get_settings

router = APIRouter(prefix="/forums", tags=["Foros"])


class ForumResponse(BaseModel):
    id: int
    course_id: int
    name: str
    intro: str | None = None
    type: str | None = None


class DiscussionResponse(BaseModel):
    id: int
    name: str
    message: str | None = None
    userid: int
    userfullname: str | None = None
    created: int | None = None
    modified: int | None = None
    numreplies: int = 0


class PostResponse(BaseModel):
    id: int
    discussion_id: int
    parent_id: int
    userid: int
    userfullname: str | None = None
    message: str
    created: int | None = None


class ReplyRequest(BaseModel):
    message: str


class ReplyResponse(BaseModel):
    success: bool
    post_id: int | None = None
    message: str


@router.get("/course/{course_id}", response_model=List[ForumResponse])
async def get_course_forums(
    course_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Lista todos los foros de un curso.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    forums = await moodle.get_forums(course_id)

    return [
        ForumResponse(
            id=forum["id"],
            course_id=forum.get("course", course_id),
            name=forum.get("name", ""),
            intro=forum.get("intro"),
            type=forum.get("type"),
        )
        for forum in forums
    ]


@router.get("/{forum_id}/discussions", response_model=List[DiscussionResponse])
async def get_forum_discussions(
    forum_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Lista las discusiones de un foro.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    discussions = await moodle.get_forum_discussions(forum_id)

    return [
        DiscussionResponse(
            id=discussion["id"],
            name=discussion.get("name", ""),
            message=discussion.get("message"),
            userid=discussion.get("userid", 0),
            userfullname=discussion.get("userfullname"),
            created=discussion.get("created"),
            modified=discussion.get("modified"),
            numreplies=discussion.get("numreplies", 0),
        )
        for discussion in discussions
    ]


@router.get("/discussions/{discussion_id}/posts", response_model=List[PostResponse])
async def get_discussion_posts(
    discussion_id: int, current_user: dict = Depends(get_current_user)
):
    """
    Obtiene los mensajes de una discusión.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    posts = await moodle.get_discussion_posts(discussion_id)

    return [
        PostResponse(
            id=post["id"],
            discussion_id=post.get("discussion", discussion_id),
            parent_id=post.get("parent", 0),
            userid=post.get("userid", 0),
            userfullname=post.get("userfullname"),
            message=post.get("message", ""),
            created=post.get("created"),
        )
        for post in posts
    ]


@router.post("/discussions/{discussion_id}/reply", response_model=ReplyResponse)
async def reply_to_discussion(
    discussion_id: int,
    request: ReplyRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Publica una respuesta en una discusión.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    # Obtener el primer post de la discusión para responder
    posts = await moodle.get_discussion_posts(discussion_id)
    if not posts:
        raise HTTPException(status_code=404, detail="Discusión no encontrada")

    parent_post_id = posts[0]["id"]
    result = await moodle.add_discussion_post(parent_post_id, request.message)

    if not result:
        raise HTTPException(status_code=400, detail="Error al publicar respuesta")

    return ReplyResponse(
        success=True, post_id=result.get("postid"), message="Respuesta publicada"
    )
