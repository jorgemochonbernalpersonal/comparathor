from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.user_service import UserService
from app.db.schemas import UserResponse, UserUpdate
from app.core.security import get_current_user
from typing import List
from app.core.logging_config import logger


router = APIRouter(
    tags=["Users"]
)  # 👈 Quitamos el prefix porque ya está en `include_router()`
user_service = UserService()


@router.get("/me", response_model=UserResponse, name="Obtener Perfil del Usuario")
async def get_my_profile(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """📌 Obtiene el perfil del usuario autenticado."""
    logger.info(f"✅ Perfil accedido por {current_user.email}")
    return current_user


@router.get("/users", response_model=List[UserResponse], name="Listar Usuarios")
async def list_users(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    print("📢 Endpoint `/users/` fue llamado")
    logger.info("🔍 Se ejecutó correctamente /users/, devolviendo datos...")

    if current_user.role != "admin":
        logger.warning(f"🚨 Acceso no autorizado a /users por {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado"
        )

    try:
        print("📢 Ejecutando consulta en DB...")
        result = await db.execute("SELECT * FROM users;")
        users = result.fetchall()
        print(
            f"📢 Usuarios en DB: {users}"
        )  # 👈 Esto debe mostrar los usuarios en la terminal

        return users
    except Exception as e:
        print(f"❌ Error en SQL: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/{user_id}", response_model=UserResponse, name="Obtener Usuario por ID")
async def get_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """📌 Obtiene un usuario por ID."""
    try:
        user = await user_service.get_user(user_id, db)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        logger.info(f"👤 Usuario {user_id} obtenido por {current_user.email}")
        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.put("/{user_id}", response_model=UserResponse, name="Actualizar Usuario")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """📌 Actualiza la información de un usuario."""
    try:
        if current_user.role != "admin" and current_user.id != user_id:
            logger.warning(
                f"🚨 Acceso no autorizado para actualizar usuario {user_id} por {current_user.email}"
            )
            raise HTTPException(status_code=403, detail="No autorizado")

        updated_user = await user_service.update_user(user_id, user_data, db)
        if not updated_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        logger.info(f"✏️ Usuario {user_id} actualizado por {current_user.email}")
        return updated_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error actualizando usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/{user_id}", name="Eliminar Usuario")
async def delete_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """📌 Elimina un usuario (solo administradores)."""
    if current_user.role != "admin":
        logger.warning(
            f"🚨 Acceso no autorizado a eliminar usuario {user_id} por {current_user.email}"
        )
        raise HTTPException(status_code=403, detail="No autorizado")

    try:
        success = await user_service.delete_user(user_id, db)
        if not success:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        logger.info(f"🗑️ Usuario {user_id} eliminado por {current_user.email}")
        return {"message": "Usuario eliminado exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error eliminando usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
