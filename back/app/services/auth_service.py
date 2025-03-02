from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from datetime import datetime

from app.db.models.user import User
from app.db.schemas import UserCreate, UserResponse
from app.core.password import get_password_hash, verify_password
from app.core.logging_config import logger


class AuthService:
    async def register(self, user_data: UserCreate, db: AsyncSession):
        """📌 Registra un usuario con el rol 'registered' por defecto."""
        async with db.begin():  # 🔹 Inicia la transacción
            # 🔹 Verificar si el usuario ya existe
            result = await db.execute(select(User).where(User.email == user_data.email))
            existing_user = result.scalars().first()

            if existing_user:
                logger.warning(
                    f"⚠️ Intento de registro con correo ya existente: {user_data.email}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo ya está registrado.",
                )

            # 🔹 Hashear la contraseña antes de guardarla
            hashed_password = get_password_hash(user_data.password)
            default_role_id = 2  # Rol por defecto para usuarios registrados

            # 🔹 Crear el nuevo usuario en la base de datos
            new_user = User(
                name=user_data.name,
                email=user_data.email,
                password_hash=hashed_password,
                role_id=default_role_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            logger.info(f"✅ Nuevo usuario registrado: {new_user.email}")

            # 🔹 Retornar el usuario en el formato correcto
            return UserResponse(
                id=new_user.id,
                name=new_user.name,
                email=new_user.email,
                role_id=new_user.role_id,
                created_at=new_user.created_at,
                updated_at=new_user.updated_at,
                ratings=[],
            )

    async def login(self, email: str, password: str, db: AsyncSession):
        """📌 Autentica a un usuario verificando sus credenciales."""

        try:
            async with db.begin():  # 🔹 Manejo seguro de la sesión
                result = await db.execute(
                    select(User)
                    .where(User.email == email)
                    .options(
                        joinedload(User.role)
                    )  # 🔹 Evita problemas de lazy loading
                )
                user = result.scalars().first()

                if not user:
                    logger.warning(f"⚠️ Usuario no encontrado: {email}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Correo o contraseña incorrectos.",
                    )

                logger.debug(f"🔑 Hash en DB: {user.password_hash}")
                logger.debug(f"🔑 Contraseña ingresada: {password}")
                logger.debug(f"🔍 Verificando contraseña...")

                # Verificar la contraseña
                if not verify_password(password, user.password_hash):
                    logger.warning(f"⚠️ Contraseña incorrecta para usuario: {email}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Correo o contraseña incorrectos.",
                    )

                logger.info(f"✅ Usuario autenticado: {email}")
                return user

        except HTTPException:
            raise  # ⬅️ Se relanza la excepción para que FastAPI la maneje correctamente.

        except Exception as e:
            logger.error(f"❌ Error inesperado en login: {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
