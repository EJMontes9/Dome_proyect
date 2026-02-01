from google.oauth2 import id_token
from google.auth.transport import requests


async def verify_google_token(token: str, client_id: str) -> dict | None:
    """
    Verifica un token de Google OAuth y retorna la información del usuario.

    Args:
        token: El ID token de Google
        client_id: El Client ID de Google OAuth

    Returns:
        Dict con email, name, picture si es válido, None si no
    """
    try:
        # Verificar el token con Google
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), client_id
        )

        # Verificar que el token sea de nuestro cliente
        if idinfo["aud"] != client_id:
            return None

        return {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "email_verified": idinfo.get("email_verified", False),
        }
    except ValueError:
        # Token inválido
        return None
