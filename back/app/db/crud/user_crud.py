from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.db.models.user import User
from app.db.schemas import UserCreate, UserUpdate
from app.core.password import get_password_hash  

async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """🔍 Obtiene un usuario por ID."""
    return await db.get(User, user_id)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """📩 Obtiene un usuario por su email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_all_users(db: AsyncSession) -> List[User]:
    """📋 Obtiene todos los usuarios."""
    result = await db.execute(select(User))
    return result.scalars().all()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """🆕 Crea un nuevo usuario."""
    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role_id=2,  # Rol por defecto
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def update_user(
    db: AsyncSession, user_id: int, user_data: UserUpdate
) -> Optional[User]:
    """✏️ Actualiza un usuario."""
    user = await get_user(db, user_id)
    if not user:
        return None

    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int) -> bool:
    """🗑️ Elimina un usuario."""
    user = await get_user(db, user_id)
    if not user:
        return False

    await db.delete(user)
    await db.commit()
    return True
