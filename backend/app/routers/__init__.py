from .auth import router as auth_router
from .courses import router as courses_router
from .assignments import router as assignments_router
from .forums import router as forums_router

__all__ = ["auth_router", "courses_router", "assignments_router", "forums_router"]
