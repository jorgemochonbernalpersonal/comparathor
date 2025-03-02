from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.models.rating import Rating
from app.db.schemas import RatingCreate
from app.db.crud.rating_crud import get_rating, get_all_ratings, create_rating


class RatingService:
    async def list_ratings(self, db: AsyncSession) -> List[Rating]:
        return await get_all_ratings(db)

    async def get_rating(self, rating_id: int, db: AsyncSession) -> Rating:
        rating = await get_rating(db, rating_id)
        if not rating:
            raise HTTPException(status_code=404, detail="Rating not found")
        return rating

    async def create_rating(
        self, rating_data: RatingCreate, db: AsyncSession
    ) -> Rating:
        return await create_rating(db, rating_data)
