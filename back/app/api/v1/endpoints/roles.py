from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
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
