from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.roles import router as roles_router
from app.db.mongodb import initialize_collections, test_connection

app = FastAPI(
    title="Comparathor API",
    description="API for managing products and user authentication in Comparathor",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)


# Evento de inicio
@app.on_event("startup")
async def startup_event():
    """
    Verifica la conexión a MongoDB y configura las colecciones necesarias.
    """
    await test_connection() 
    await initialize_collections() 


app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(roles_router, prefix="/api/v1/roles", tags=["roles"])


@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raíz que da la bienvenida al usuario.
    """
    return {"message": "Welcome to Comparathor API!"}
