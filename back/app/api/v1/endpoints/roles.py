from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.dependencies import get_db
from app.db.models.roles import Role

router = APIRouter()


@router.get("/", response_model=List[Role], status_code=status.HTTP_200_OK)
async def list_roles(db=Depends(get_db)):
    """
    Listar todos los roles.
    """
    roles = await db["roles"].find().to_list(100)
    return [Role(**role) for role in roles]


@router.get("/{role_id}", response_model=Role, status_code=status.HTTP_200_OK)
async def get_role(role_id: str, db=Depends(get_db)):
    """
    Obtener un rol por ID.
    """
    if not ObjectId.is_valid(role_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de rol inválido"
        )

    role = await db["roles"].find_one({"_id": ObjectId(role_id)})
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )
    return Role(**role)


@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
async def create_role(role: Role, db=Depends(get_db)):
    """
    Crear un nuevo rol.
    """
    existing_role = await db["roles"].find_one({"name": role.name})
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del rol ya existe",
        )
    role_dict = role.model_dump(by_alias=True, exclude={"id"})
    result = await db["roles"].insert_one(role_dict)
    role.id = result.inserted_id
    return role


@router.put("/{role_id}", response_model=Role, status_code=status.HTTP_200_OK)
async def update_role(role_id: str, role: Role, db=Depends(get_db)):
    """
    Actualizar un rol existente.
    """
    if not ObjectId.is_valid(role_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de rol inválido"
        )

    existing_role = await db["roles"].find_one({"_id": ObjectId(role_id)})
    if not existing_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )

    role_dict = role.model_dump(by_alias=True, exclude={"id", "created_at"})
    role_dict["updated_at"] = datetime.now()

    await db["roles"].update_one({"_id": ObjectId(role_id)}, {"$set": role_dict})
    updated_role = await db["roles"].find_one({"_id": ObjectId(role_id)})
    return Role(**updated_role)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: str, db=Depends(get_db)):
    """
    Eliminar un rol por ID.
    """
    if not ObjectId.is_valid(role_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de rol inválido"
        )

    delete_result = await db["roles"].delete_one({"_id": ObjectId(role_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado"
        )
    return None
