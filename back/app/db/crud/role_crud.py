from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.db.models.role import Role
from app.db.schemas import RoleCreate, RoleResponse


async def get_role(db: AsyncSession, role_id: int) -> Optional[Role]:
    """Obtiene un rol por ID."""
    return await db.get(Role, role_id)


async def get_all_roles(db: AsyncSession) -> List[Role]:
    """Obtiene todos los roles."""
    result = await db.execute(select(Role))
    return result.scalars().all()


async def create_role(db: AsyncSession, role_data: RoleCreate) -> Role:
    """Crea un nuevo rol, verificando que no exista previamente."""
    existing_role = await db.execute(select(Role).where(Role.role == role_data.role))
    if existing_role.scalars().first():
        raise ValueError("El rol ya existe")

    new_role = Role(**role_data.dict())
    db.add(new_role)
    await db.commit()
    await db.refresh(new_role)
    return new_role


async def update_role(
    db: AsyncSession, role_id: int, new_data: RoleCreate
) -> Optional[Role]:
    """Actualiza un rol existente."""
    role = await db.get(Role, role_id)
    if not role:
        return None

    role.role = new_data.role
    await db.commit()
    await db.refresh(role)
    return role


async def delete_role(db: AsyncSession, role_id: int) -> bool:
    """Elimina un rol si existe."""
    role = await db.get(Role, role_id)
    if not role:
        return False

    await db.delete(role)
    await db.commit()
    return True
