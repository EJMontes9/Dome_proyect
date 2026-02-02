from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import get_settings

security = HTTPBearer()

# Duracion del refresh token (7 dias)
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(data: dict[str, Any]) -> str:
    """Crea un token JWT de acceso con los datos proporcionados."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiration_minutes)
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Crea un token JWT de refresh con duracion extendida."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Decodifica y valida un token JWT de acceso."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        # Verificar que sea un token de acceso
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Tipo de token invalido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token invalido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decodifica y valida un refresh token. Retorna None si es invalido."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        # Verificar que sea un refresh token
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Obtiene el usuario actual a partir del token JWT."""
    token = credentials.credentials
    return decode_access_token(token)
