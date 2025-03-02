from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import (
    auth,
    users,  # Ahora correctamente integrado
    products,
    comparisons,
    roles,
    ratings,
    websockets,
)
from app.core.logging_config import logger
from app.core.middlewares import SecurityMiddleware, RateLimitMiddleware
import os
from fastapi.openapi.utils import get_openapi
import logging
from pydantic import ValidationError
from fastapi.responses import JSONResponse

# Crear la instancia de la aplicación FastAPI
app = FastAPI(
    title="Comparathor API",
    description="API para la comparación de productos con autenticación y carga de imágenes en Cloudinary.",
    version="1.0.0",
    contact={"name": "Soporte Comparathor", "email": "support@comparathor.com"},
    license_info={"name": "MIT License", "url": "https://opensource.org/licenses/MIT"},
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "displayRequestDuration": True,
        "docExpansion": "none",
        "tryItOutEnabled": True,
        "filter": True,
    },
)

# Configuración de logs
logger = logging.getLogger("uvicorn")

# Manejo de errores de validación
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.warning(f"⚠️ Error de validación en {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Generación de OpenAPI personalizada
def custom_openapi():
    if not app.openapi_schema:
        app.openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
    return app.openapi_schema

app.openapi = custom_openapi

# Configuración de CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # 👈 Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # 👈 Permite todos los headers, incluido Authorization
)

# Registro de middlewares personalizados (descomentar si los has definido)
# app.add_middleware(SecurityMiddleware)
# app.add_middleware(RateLimitMiddleware)

# Registro de routers con sus prefijos correctos
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(comparisons.router, prefix="/api/v1/comparisons", tags=["Comparisons"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["Roles"])
app.include_router(ratings.router, prefix="/api/v1/ratings", tags=["Ratings"])
app.include_router(websockets.router, prefix="/api/v1/websockets", tags=["WebSockets"])

logger.warning(f"🚨 A")

# Mensajes de inicio para verificar que todas las rutas están registradas correctamente
logger.info("✅ Todas las rutas han sido registradas")
for route in app.routes:
    logger.debug(f"📌 {route.name} → {route.path}")
