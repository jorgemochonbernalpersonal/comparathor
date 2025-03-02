from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.rating_service import RatingService
from app.db.schemas import RatingResponse, RatingCreate
from app.core.security import get_current_user_role
from app.core.logging_config import logger

router = APIRouter()
rating_service = RatingService()


@router.post(
    "/",
    response_model=RatingResponse,
    name="Crear una Nueva Puntuación",
    description="""
    **📌 Endpoint para agregar una puntuación a un producto.**  
    🔹 **Solo usuarios registrados o administradores pueden calificar productos.**  
    🔹 **Debe proporcionar un ID de producto y una puntuación válida (1-5).**  
    """,
)
async def create_rating(
    rating_data: RatingCreate,
    db: AsyncSession = Depends(get_db),
    user_role: str = Depends(get_current_user_role),
):
    """
    **📌 Crear una nueva puntuación para un producto**

    - 🔐 **Solo usuarios registrados o administradores pueden calificar productos.**
    - 📥 **Entrada:** `product_id`, `user_id`, `score`
    - 📄 **Salida:** Objeto con la puntuación creada.
    """
    if user_role not in ["admin", "registered"]:
        logger.warning(f"❌ Intento no autorizado de puntuación por {user_role}")
        raise HTTPException(status_code=403, detail="Not authorized")

    logger.info(
        f"✅ Puntuación creada para producto {rating_data.product_id} por usuario {user_role}"
    )
    return await rating_service.create_rating(rating_data, db)
