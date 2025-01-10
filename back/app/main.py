from fastapi import FastAPI
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.roles import router as roles_router


app = FastAPI(
    title="Comparathor API",
    description="API for managing products and user authentication in Comparathor",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(roles_router, prefix="/api/v1/roles", tags=["roles"])


@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raíz que da la bienvenida al usuario.
    """
    return {"message": "Welcome to Comparathor API!"}
