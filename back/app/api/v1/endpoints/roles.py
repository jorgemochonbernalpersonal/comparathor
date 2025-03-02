from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.role_service import RoleService
from app.db.schemas import RoleResponse, RoleCreate
from app.core.logging_config import logger

router = APIRouter()
role_service = RoleService()


@router.get("/", response_model=List[RoleResponse], name="Obtener Lista de Roles")
async def list_roles(db: AsyncSession = Depends(get_db)):
    """📌 **Lista todos los roles disponibles**"""
    logger.info("✅ Lista de roles solicitada")
    return await role_service.list_roles(db)


@router.post("/", response_model=RoleResponse, name="Crear un Nuevo Rol")
async def create_role(role_data: RoleCreate, db: AsyncSession = Depends(get_db)):
    """📌 **Crea un nuevo rol** (evita duplicados)"""
    logger.info(f"✅ Rol creado: {role_data.role}")
    return await role_service.create_role(role_data, db)


@router.put("/{role_id}", response_model=RoleResponse, name="Actualizar Rol")
async def update_role(
    role_id: int, role_data: RoleCreate, db: AsyncSession = Depends(get_db)
):
    """📌 **Actualiza un rol existente**"""
    logger.info(f"🔄 Actualizando rol ID {role_id} → {role_data.role}")
    return await role_service.update_role(role_id, role_data, db)


@router.delete("/{role_id}", name="Eliminar Rol")
async def delete_role(role_id: int, db: AsyncSession = Depends(get_db)):
    """📌 **Elimina un rol existente**"""
    logger.warning(f"🗑️ Eliminando rol ID {role_id}")
    await role_service.delete_role(role_id, db)
    return {"message": "Rol eliminado exitosamente"}
