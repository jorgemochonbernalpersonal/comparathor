from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import List, Optional, Dict, Any
from app.db.models.product import Product
from app.db.schemas import ProductCreate, ProductUpdate
from app.db.crud.product_crud import (
    get_product,
    get_all_products,
    create_product,
    update_product,
    delete_product,
)
from app.core.cloudinary_config import delete_image_from_cloudinary
from app.api.v1.endpoints.websockets import send_notification
from app.core.logging_config import logger


class ProductService:
    async def list_products(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 10,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Lista los productos con paginación y filtros opcionales.
        """
        products, total = await get_all_products(
            db, skip, limit, category, brand, min_price, max_price
        )
        return {"total": total, "products": products}

    async def get_product(self, product_id: int, db: AsyncSession) -> Product:
        """
        Obtiene un producto por ID.
        """
        product = await get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    async def create_product(
        self, product_data: ProductCreate, db: AsyncSession
    ) -> Product:
        """
        Crea un nuevo producto y envía una notificación en WebSockets.
        """
        product = await create_product(db, product_data)
        logger.info(f"🆕 Producto creado: {product.name}")
        await send_notification(f"🆕 Nuevo producto agregado: {product.name}")
        return product

    async def update_product(
        self, product_id: int, product_data: ProductUpdate, db: AsyncSession
    ) -> Product:
        """
        Actualiza un producto y envía una notificación en WebSockets.
        """
        product = await update_product(db, product_id, product_data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        logger.info(f"🔄 Producto actualizado: {product.name}")
        await send_notification(f"🔄 Producto actualizado: {product.name}")
        return product

    async def delete_product(self, product_id: int, db: AsyncSession):
        """
        Elimina un producto y su imagen de Cloudinary si existe.
        """
        product = await get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.image_url:
            logger.info(f"🗑️ Eliminando imagen en Cloudinary: {product.image_url}")
            delete_image_from_cloudinary(product.image_url)

        success = await delete_product(db, product_id)
        if success:
            logger.info(f"🗑️ Producto eliminado: {product_id}")
            await send_notification(f"🗑️ Producto eliminado: {product_id}")
        return success
