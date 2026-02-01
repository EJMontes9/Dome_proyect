from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Moodle
    moodle_url: str = "http://localhost:8080"
    moodle_token: str = ""

    # Google OAuth
    google_client_id: str = ""

    # JWT
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60

    # App
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
