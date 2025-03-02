from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.db.schemas import UserCreate, UserLogin, TokenResponse, LogoutRequest
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
)
from app.core.logging_config import logger

router = APIRouter(prefix="/auth", tags=["Auth"])
BLACKLISTED_TOKENS = set()  
auth_service = AuthService()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    name="Registro de Usuario",
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """📌 Registra un nuevo usuario y devuelve tokens"""
    try:
        async with db.begin():
            user = await auth_service.register(user_data, db)

        access_token = create_access_token({"sub": user.email, "role": user.role_id})
        refresh_token = create_refresh_token({"sub": user.email, "role": user.role_id})

        logger.info(f"✅ Nuevo usuario registrado: {user.email}")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role_id,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            },
        }

    except HTTPException as http_err:
        raise http_err

    except Exception as e:
        logger.error(f"❌ Error inesperado en registro: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """📌 Autentica a un usuario verificando sus credenciales"""
    try:
        user = await auth_service.login(user_data.email, user_data.password, db)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        access_token = create_access_token({"sub": user.email, "role": user.role.role})
        refresh_token = create_refresh_token(
            {"sub": user.email, "role": user.role.role}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.role,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado en login: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post(
    "/refresh-token",
    response_model=TokenResponse,
    name="Renovar Token",
    description="Renueva el Access Token usando un Refresh Token válido.",
)
async def refresh_token(refresh_token: str):
    """📌 Renueva el Access Token si el Refresh Token es válido"""
    try:
        if refresh_token in BLACKLISTED_TOKENS:
            logger.warning(f"🚨 Refresh Token revocado intentado usar: {refresh_token}")
            raise HTTPException(status_code=401, detail="Token revocado o expirado")

        payload = decode_access_token(refresh_token)

        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Token inválido o expirado")

        new_access_token = create_access_token(
            {"sub": payload["sub"], "role": payload["role"]}
        )

        logger.info(f"🔄 Refresh Token usado para: {payload['sub']}")

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.warning(f"❌ Intento fallido de refresh token: {str(e)}")
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(request: LogoutRequest):
    """📌 Invalida el refresh token para cerrar sesión."""
    try:
        if not request.refresh_token:
            raise HTTPException(status_code=400, detail="Refresh token es requerido")

        BLACKLISTED_TOKENS.add(request.refresh_token)
        logger.info(f"🚪 Token revocado: {request.refresh_token}")

        return {"message": "Sesión cerrada exitosamente"}

    except Exception as e:
        logger.error(f"❌ Error en logout: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
