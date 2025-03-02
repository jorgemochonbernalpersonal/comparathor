from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.comparison_service import ComparisonService
from app.db.schemas import ComparisonResponse
from app.core.security import get_current_user_role
from app.core.logging_config import logger

router = APIRouter()
comparison_service = ComparisonService()


@router.get(
    "/",
    response_model=list[ComparisonResponse],
    name="Listar Comparaciones",
    description="""
    📌 **Lista todas las comparaciones disponibles.**  
    🔹 **Acceso:** Usuarios `admin`, `registered` y `public`.  
    🔹 **Devuelve una lista de comparaciones guardadas en la base de datos.
    """,
)
async def list_comparisons(
    db: AsyncSession = Depends(get_db), user_role: str = Depends(get_current_user_role)
):
    """
    **📌 Obtener todas las comparaciones**

    - 🔹 **Accesible para:** `admin`, `registered`, `public`
    - 📄 **Salida:** Lista de comparaciones disponibles.
    """
    logger.info(f"📄 Comparaciones solicitadas por usuario con rol {user_role}")
    return await comparison_service.list_comparisons(db)


@router.get(
    "/search",
    response_model=list[ComparisonResponse],
    name="Buscar Comparaciones",
    description="""
    📌 **Busca comparaciones guardadas en la base de datos.**  
    🔹 **Acceso:** Solo `admin` y `registered`.  
    🔹 **Devuelve una lista de comparaciones filtradas.**
    """,
)
async def search_saved_comparisons(
    db: AsyncSession = Depends(get_db), user_role: str = Depends(get_current_user_role)
):
    """
    **📌 Buscar comparaciones guardadas**

    - 🔹 **Accesible solo para:** `admin`, `registered`
    - ❌ **No permitido para:** `public`
    - 📄 **Salida:** Lista de comparaciones filtradas.
    """
    if user_role not in ["admin", "registered"]:
        logger.warning(
            f"🔒 Intento NO AUTORIZADO de búsqueda de comparaciones por usuario {user_role}"
        )
        raise HTTPException(status_code=403, detail="Not authorized")

    logger.info(f"🔎 Búsqueda de comparaciones realizada por {user_role}")
    return await comparison_service.list_comparisons(db)
