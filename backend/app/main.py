from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routers import auth_router, courses_router, assignments_router, forums_router

settings = get_settings()

app = FastAPI(
    title="Moodle Mobile API",
    description="API intermediaria para la aplicación móvil de Moodle",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(assignments_router)
app.include_router(forums_router)


@app.get("/", tags=["Health"])
async def root():
    """Endpoint de salud."""
    return {"status": "ok", "message": "Moodle Mobile API"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Verificación de salud del servicio."""
    return {
        "status": "healthy",
        "moodle_url": settings.moodle_url,
        "debug": settings.debug,
    }
