from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.db.models.rating import Rating
from app.db.schemas import RatingCreate


async def get_rating(db: AsyncSession, rating_id: int) -> Optional[Rating]:
    """Obtiene una puntuación por ID."""
    return await db.get(Rating, rating_id)


async def get_all_ratings(db: AsyncSession) -> List[Rating]:
    """Obtiene todas las puntuaciones."""
    result = await db.execute(select(Rating))
    return result.scalars().all()


async def create_rating(db: AsyncSession, rating_data: RatingCreate) -> Rating:
    """Crea una nueva puntuación."""
    new_rating = Rating(**rating_data.dict())
    db.add(new_rating)
    await db.commit()
    await db.refresh(new_rating)
    return new_rating
