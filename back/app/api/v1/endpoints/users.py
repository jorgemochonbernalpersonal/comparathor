from fastapi import APIRouter, HTTPException, status, Depends, Body
from typing import List
from datetime import datetime
from bson import ObjectId
from app.db.dependencies import get_db
from app.db.models.users import User
from app.core.security import get_password_hash, verify_password

router = APIRouter()


@router.get("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def get_user(user_id: str, db=Depends(get_db)):
    """
    Endpoint para obtener un usuario por su ID.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido"
        )

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    return User(**user)


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: User, db=Depends(get_db)):
    print("Datos recibidos:", user.dict())
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado.",
        )

    user_dict = user.model_dump(by_alias=True, exclude={"id", "password"})
    if user.password:
        user_dict["password_hash"] = get_password_hash(user.password)

    result = await db["users"].insert_one(user_dict)
    user.id = result.inserted_id

    print(f"Usuario creado con ID {user.id} y correo {user.email}")

    return user


@router.post("/login")
async def login_user(
    db=Depends(get_db),
    email: str = Body(..., embed=True, description="Correo electrónico del usuario"),
    password: str = Body(..., embed=True, description="Contraseña del usuario"),
):
    """
    Endpoint para autenticar a un usuario.
    """
    user = await db["users"].find_one({"email": email})
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
        )
    return {"message": "Autenticación exitosa"}


@router.put("/{user_id}", response_model=User, status_code=status.HTTP_200_OK)
async def update_user(user_id: str, user: User, db=Depends(get_db)):
    """
    Endpoint para actualizar un usuario existente.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido"
        )

    existing_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    user_dict = user.model_dump(by_alias=True, exclude={"id", "password"})
    if user.password:
        user_dict["password_hash"] = get_password_hash(user.password)

    await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": user_dict})
    updated_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    return User(**updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, db=Depends(get_db)):
    """
    Endpoint para eliminar un usuario por su ID.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido"
        )

    delete_result = await db["users"].delete_one({"_id": ObjectId(user_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )
    return None
