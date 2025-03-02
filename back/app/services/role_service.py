from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.models.role import Role
from app.db.schemas import RoleCreate
from app.db.crud.role_crud import (
    get_role,
    get_all_roles,
    create_role,
    update_role,
    delete_role,
)


class RoleService:
    async def list_roles(self, db: AsyncSession) -> List[Role]:
        return await get_all_roles(db)

    async def get_role(self, role_id: int, db: AsyncSession) -> Role:
        role = await get_role(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    async def create_role(self, role_data: RoleCreate, db: AsyncSession) -> Role:
        try:
            return await create_role(db, role_data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def update_role(
        self, role_id: int, new_data: RoleCreate, db: AsyncSession
    ) -> Role:
        role = await update_role(db, role_id, new_data)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    async def delete_role(self, role_id: int, db: AsyncSession):
        success = await delete_role(db, role_id)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
