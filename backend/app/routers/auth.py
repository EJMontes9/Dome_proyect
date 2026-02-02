from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..services.oauth_service import verify_google_token
from ..services.moodle_client import MoodleClient
from ..utils.security import create_access_token, create_refresh_token, get_current_user, decode_refresh_token
from ..config import get_settings

router = APIRouter(prefix="/auth", tags=["Autenticacion"])


# ==================== Schemas ====================

class GoogleLoginRequest(BaseModel):
    id_token: str


class DevLoginRequest(BaseModel):
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    fullname: str


class MoodleStatusResponse(BaseModel):
    connected: bool
    site_name: Optional[str] = None
    error: Optional[str] = None


# ==================== Helpers ====================

async def _create_auth_response(moodle_user: dict, settings) -> TokenResponse:
    """Crea la respuesta de autenticacion con tokens."""
    token_data = {
        "sub": str(moodle_user["id"]),
        "email": moodle_user["email"],
        "fullname": moodle_user["fullname"],
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.jwt_expiration_minutes * 60,
        user={
            "id": moodle_user["id"],
            "email": moodle_user["email"],
            "fullname": moodle_user["fullname"],
        },
    )


# ==================== Endpoints ====================

@router.post("/google", response_model=TokenResponse)
async def login_with_google(request: GoogleLoginRequest):
    """
    Inicia sesion con Google OAuth.
    Valida el token de Google y verifica que el usuario exista en Moodle.
    """
    settings = get_settings()

    # Verificar token de Google
    google_user = await verify_google_token(request.id_token, settings.google_client_id)
    if not google_user:
        raise HTTPException(status_code=401, detail="Token de Google invalido")

    # Verificar que el usuario exista en Moodle
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)
    moodle_user = await moodle.get_user_by_email(google_user["email"])

    if not moodle_user:
        raise HTTPException(
            status_code=403,
            detail="Usuario no registrado en Moodle. Contacta al administrador.",
        )

    return await _create_auth_response(moodle_user, settings)


@router.post("/dev-login", response_model=TokenResponse)
async def dev_login(request: DevLoginRequest = None):
    """
    Login de desarrollo (solo disponible en modo debug).
    Permite autenticarse sin Google OAuth para pruebas locales.
    """
    settings = get_settings()

    if not settings.debug:
        raise HTTPException(
            status_code=403,
            detail="Este endpoint solo esta disponible en modo desarrollo",
        )

    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    # Si se proporciona email, buscar ese usuario
    if request and request.email:
        moodle_user = await moodle.get_user_by_email(request.email)
        if not moodle_user:
            raise HTTPException(
                status_code=404,
                detail=f"Usuario con email {request.email} no encontrado en Moodle",
            )
    else:
        # Usar el usuario admin por defecto
        site_info = await moodle.get_site_info()
        moodle_user = {
            "id": site_info.get("userid", 2),
            "email": site_info.get("username", "admin") + "@localhost.com",
            "fullname": site_info.get("fullname", "Admin User"),
        }

    return await _create_auth_response(moodle_user, settings)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresca el token de acceso usando el refresh token.
    """
    settings = get_settings()

    # Decodificar refresh token
    payload = decode_refresh_token(request.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Refresh token invalido o expirado")

    # Crear nuevos tokens
    token_data = {
        "sub": payload["sub"],
        "email": payload["email"],
        "fullname": payload["fullname"],
    }

    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=settings.jwt_expiration_minutes * 60,
        user={
            "id": int(payload["sub"]),
            "email": payload["email"],
            "fullname": payload["fullname"],
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Obtiene informacion del usuario autenticado.
    """
    return UserResponse(
        id=int(current_user["sub"]),
        email=current_user["email"],
        fullname=current_user["fullname"],
    )


@router.get("/moodle-status", response_model=MoodleStatusResponse)
async def check_moodle_connection():
    """
    Verifica la conexion con el servidor Moodle.
    Util para diagnostico y configuracion inicial.
    """
    settings = get_settings()
    moodle = MoodleClient(settings.moodle_url, settings.moodle_token)

    try:
        site_info = await moodle.get_site_info()
        return MoodleStatusResponse(
            connected=True,
            site_name=site_info.get("sitename", "Moodle"),
        )
    except Exception as e:
        return MoodleStatusResponse(
            connected=False,
            error=str(e),
        )
