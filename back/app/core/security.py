from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models.user import User
from app.db.schemas import UserResponse
from app.db.crud.user_crud import get_user_by_email
from app.core.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

from app.core.logging_config import logger

# Configuración del esquema de autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Lista de tokens revocados (para manejar logout y revocación de tokens)
BLACKLISTED_TOKENS = set()


### 🔥 FUNCIONES PARA GENERAR TOKENS JWT


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    📌 Genera un Access Token JWT con información del usuario.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = data.copy()
    to_encode.update(
        {"exp": expire.timestamp()}
    )  # ✅ Se almacena `exp` como timestamp UTC

    try:
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info("✅ Access Token generado correctamente.")
        return token
    except Exception as e:
        logger.error(f"❌ Error generando token JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno generando el token",
        )


def create_refresh_token(data: dict) -> str:
    """🔄 Genera un Refresh Token JWT con una expiración más larga."""
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update(
        {"exp": expire.timestamp()}
    )  # ✅ Se almacena `exp` como timestamp UTC

    try:
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info("🔄 Refresh Token generado correctamente.")
        return token
    except Exception as e:
        logger.error(f"❌ Error generando refresh token JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno generando el refresh token",
        )


def decode_access_token(token: str) -> Dict:
    """
    📌 Decodifica un Access Token JWT y maneja errores de autenticación.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        logger.info("✅ Access decode.")

        # ✅ Extraer `exp` correctamente del token y convertirlo a UTC
        exp = payload.get("exp")
        if exp:
            expiration_time = datetime.fromtimestamp(exp, timezone.utc)
            current_time = datetime.now(timezone.utc)

            if expiration_time < current_time:
                logger.warning("⏳ Token expirado.")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expirado",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        logger.info(f"🔓 Token decodificado correctamente: {payload}")
        return payload

    except JWTError as e:
        logger.warning(f"⚠️ Token inválido o expirado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


### 🔥 FUNCIONES PARA OBTENER EL USUARIO ACTUAL Y SU ROL


async def get_current_user_role(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> str:
    """
    📌 Obtiene el rol del usuario autenticado desde el JWT.
    """
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        logger.info("✅ curre .")
        logger.info(f"✅ Per {email}")
        
        logger.info(f"✅ Per {payload}")


        if not email:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = await get_user_by_email(db, email)
        logger.info(f"✅ usser {user}")


        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        logger.info(
            f"✅ Rol obtenido correctamente: {user.role.role if user.role else 'N/A'}"
        )
        return (
            user.role.role if user.role else "N/A"
        )  # 🔥 Convertir role a string si es un objeto SQLAlchemy

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado obteniendo el rol del usuario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    📌 Obtiene el usuario autenticado desde el token JWT.
    """
    logger.info("🔑 Intentando."  + {token})
    print(f"📢 Token recibido: {token}")  # 👈 Esto debe aparecer en la terminal
    logger.info("🔑 Intentando obtener usuario {token}")


    # Verificar si el token está en la lista negra (revocado)
    if token in BLACKLISTED_TOKENS:
        logger.warning("🚨 Intento de acceso con token revocado.")
        raise HTTPException(status_code=401, detail="Token inválido o revocado.")

    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        logger.info("🔑 Intentando obtener usuario {email}")


        if not email:
            logger.warning("⚠️ Token sin email asociado.")
            raise HTTPException(status_code=401, detail="Token inválido")

        user = await get_user_by_email(db, email)

        if not user:
            logger.warning(f"⚠️ Usuario no encontrado para email: {email}")
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        logger.info(f"✅ Usuario autenticado: {user.email}")

        # Convertir a `UserResponse` para evitar errores de serialización
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.role if user.role else "",  # 🔥 Convertir role a string
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado obteniendo el usuario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )
