from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..services.oauth_service import verify_google_token
from ..services.moodle_client import MoodleClient
from ..utils.security import create_access_token, get_current_user
from ..config import get_settings

router = APIRouter(prefix="/auth", tags=["Autenticación"])


class GoogleLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    fullname: str


@router.post("/google", response_model=TokenResponse)
async def login_with_google(request: GoogleLoginRequest):
    """
    Inicia sesión con Google OAuth.
    Valida el token de Google y verifica que el usuario exista en Moodle.
    """
    settings = get_settings()

    # Verificar token de Google
    google_user = await verify_google_token(request.id_token, settings.google_client_id)
    if not google_user:
        raise HTTPException(status_code=401, detail="Token de Google inválido")

    # Verificar que el usuario exista en Moodle
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)
    moodle_user = await moodle.get_user_by_email(google_user["email"])

    if not moodle_user:
        raise HTTPException(
            status_code=403,
            detail="Usuario no registrado en Moodle. Contacta al administrador.",
        )

    # Crear token JWT
    token_data = {
        "sub": str(moodle_user["id"]),
        "email": moodle_user["email"],
        "fullname": moodle_user["fullname"],
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        user={
            "id": moodle_user["id"],
            "email": moodle_user["email"],
            "fullname": moodle_user["fullname"],
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Obtiene información del usuario autenticado.
    """
    return UserResponse(
        id=int(current_user["sub"]),
        email=current_user["email"],
        fullname=current_user["fullname"],
    )
