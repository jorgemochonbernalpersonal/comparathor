from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.models.user import User
from app.db.schemas import UserCreate, UserUpdate, UserResponse
from app.db.crud.user_crud import (
    get_user,
    get_all_users,
    create_user,
    update_user,
    delete_user,
)
from sqlalchemy.future import select
from app.core.logging_config import logger


class UserService:
    async def list_users(self, db: AsyncSession) -> List[UserResponse]:
        """📌 Obtiene todos los usuarios, asegurando que `role` se devuelva como string."""
        logger.info("📢 Ejecutando list_users en UserService...")

        try:
            result = await db.execute(select(User))
            users = result.scalars().all()

            if not users:
                logger.warning("⚠️ No se encontraron usuarios en la base de datos.")
                return []

            logger.info(f"✅ Usuarios obtenidos correctamente: {len(users)} usuarios encontrados.")
            return [UserResponse.from_orm(user) for user in users]

        except Exception as e:
            logger.error(f"❌ Error llamando a UserService.list_users(): {str(e)}")
            raise HTTPException(status_code=500, detail="Error interno al obtener usuarios.")


    async def get_user(self, user_id: int, db: AsyncSession) -> UserResponse:
        """📌 Obtiene un usuario por ID y convierte `role` a string."""
        user = await get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.role if user.role else "N/A",  # 🔥 Convierte `role` a string
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def get_user_by_email(self, email: str, db: AsyncSession) -> UserResponse:
        """📌 Obtiene un usuario por su email y convierte `role` a string."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.role if user.role else "N/A",  # 🔥 Convierte `role` a string
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def create_user(
        self, user_data: UserCreate, db: AsyncSession
    ) -> UserResponse:
        """📌 Crea un nuevo usuario y devuelve la respuesta en formato `UserResponse`."""
        user = await create_user(db, user_data)
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.role if user.role else "N/A",  # 🔥 Convierte `role` a string
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def update_user(
        self, user_id: int, user_data: UserUpdate, db: AsyncSession
    ) -> UserResponse:
        """📌 Actualiza la información de un usuario y devuelve `UserResponse`."""
        user = await update_user(db, user_id, user_data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role.role if user.role else "N/A",  # 🔥 Convierte `role` a string
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def delete_user(self, user_id: int, db: AsyncSession):
        """📌 Elimina un usuario y maneja la excepción si no existe."""
        success = await delete_user(db, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User deleted successfully"}
