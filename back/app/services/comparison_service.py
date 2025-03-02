from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.models.comparison import Comparison
from app.db.crud.comparison_crud import get_all_comparisons


class ComparisonService:
    async def list_comparisons(self, db: AsyncSession) -> List[Comparison]:
        return await get_all_comparisons(db)
