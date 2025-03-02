from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.models.comparison import Comparison


async def get_all_comparisons(db: AsyncSession) -> List[Comparison]:
    """Obtiene todas las comparaciones."""
    result = await db.execute(select(Comparison))
    return result.scalars().all()
