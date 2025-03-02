from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.db.database import get_db
from app.services.product_service import ProductService
from app.core.cloudinary_config import upload_image_to_cloudinary
from app.core.security import get_current_user_role
from app.core.logging_config import logger
from app.db.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])
product_service = ProductService()


async def validate_and_upload_image(image: Optional[UploadFile]) -> Optional[str]:
    """📸 Valida y sube una imagen a Cloudinary."""
    if not image:
        return None
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, detail="Formato de imagen no permitido (solo JPG/PNG)."
        )
    return upload_image_to_cloudinary(image.file)


@router.post(
    "/",
    response_model=ProductResponse,
    summary="Crear un nuevo producto",
    description="""📌 **Crea un producto en la base de datos con imagen opcional**  
    🔹 **Solo permitido para administradores**  
    🔹 **Sube imagen a Cloudinary**  
    🔹 **Devuelve el producto creado con `image_url` si se adjuntó imagen**  
    """,
)
async def create_product(
    product_data: ProductCreate,
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user_role: str = Depends(get_current_user_role),
):
    if user_role != "admin":
        logger.warning("❌ Intento no autorizado de creación de producto")
        raise HTTPException(status_code=403, detail="No autorizado")

    image_url = await validate_and_upload_image(image)

    product_data_dict = product_data.model_dump()
    product_data_dict["image_url"] = image_url

    logger.info(f"🆕 Producto creado: {product_data.name} por {user_role}")
    return await product_service.create_product(product_data_dict, db)


@router.get(
    "/",
    response_model=List[ProductResponse],
    summary="Obtener productos con paginación y filtros",
    description="""📌 **Lista los productos almacenados con filtros y paginación.**  
    🔹 **Acceso público**  
    🔹 **Filtros por categoría, marca y precio**  
    🔹 **Incluye `image_url` si está disponible**  
    """,
)
async def list_products(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(
        0, ge=0, description="Número de productos a omitir para paginación"
    ),
    limit: int = Query(10, le=50, description="Máximo de productos a devolver"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    brand: Optional[str] = Query(None, description="Filtrar por marca"),
    min_price: Optional[float] = Query(
        None, ge=0, description="Filtrar por precio mínimo"
    ),
    max_price: Optional[float] = Query(
        None, ge=0, description="Filtrar por precio máximo"
    ),
):
    logger.info("📦 Listado de productos solicitado")
    return await product_service.list_products(
        db, skip, limit, category, brand, min_price, max_price
    )


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Actualizar un producto",
    description="""📌 **Actualiza los datos de un producto.**  
    🔹 **Solo permitido para administradores**  
    🔹 **Se puede actualizar información y la imagen si se adjunta una nueva**  
    🔹 **Devuelve el producto actualizado**  
    """,
)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user_role: str = Depends(get_current_user_role),
):
    if user_role != "admin":
        logger.warning(f"❌ Intento de actualización no autorizado para {product_id}")
        raise HTTPException(status_code=403, detail="No autorizado")

    image_url = await validate_and_upload_image(image)

    product_data_dict = product_data.model_dump()
    if image_url:
        product_data_dict["image_url"] = image_url

    logger.info(f"🔄 Producto actualizado: {product_id} por {user_role}")
    return await product_service.update_product(product_id, product_data_dict, db)


@router.delete(
    "/{product_id}",
    summary="Eliminar un producto",
    description="""📌 **Elimina un producto de la base de datos.**  
    🔹 **Solo permitido para administradores**  
    🔹 **Elimina también la imagen almacenada en Cloudinary si existe**  
    🔹 **Devuelve un mensaje confirmando la eliminación**  
    """,
)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    user_role: str = Depends(get_current_user_role),
):
    if user_role != "admin":
        logger.warning(f"❌ Intento de eliminación no autorizado para {product_id}")
        raise HTTPException(status_code=403, detail="No autorizado")

    await product_service.delete_product(product_id, db)
    logger.info(f"🗑️ Producto eliminado: {product_id} por {user_role}")
    return {"message": "✅ Producto eliminado exitosamente"}
