from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from typing import List, Optional, Tuple
from app.db.models.product import Product
from app.db.schemas import ProductCreate, ProductUpdate


async def get_product(db: AsyncSession, product_id: int) -> Optional[Product]:
    """Obtiene un producto por ID."""
    return await db.get(Product, product_id)


async def get_all_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> Tuple[List[Product], int]:
    """Obtiene productos con paginación, filtros y cuenta total."""

    query = select(Product)
    filters = []

    if category:
        filters.append(Product.category == category)
    if brand:
        filters.append(Product.brand == brand)
    if min_price is not None and max_price is not None:
        filters.append(and_(Product.price >= min_price, Product.price <= max_price))
    elif min_price is not None:
        filters.append(Product.price >= min_price)
    elif max_price is not None:
        filters.append(Product.price <= max_price)

    if filters:
        query = query.where(and_(*filters))

    total_query = select(func.count()).select_from(Product)
    if filters:
        total_query = total_query.where(and_(*filters))

    total_result = await db.execute(total_query)
    total_count = total_result.scalar()

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all(), total_count


async def create_product(db: AsyncSession, product_data: ProductCreate) -> Product:
    """Crea un nuevo producto."""
    new_product = Product(**product_data.dict())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product


async def update_product(
    db: AsyncSession, product_id: int, product_data: ProductUpdate
) -> Optional[Product]:
    """Actualiza un producto."""
    product = await db.get(Product, product_id)
    if not product:
        return None

    for key, value in product_data.dict(exclude_unset=True).items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    """Elimina un producto."""
    product = await db.get(Product, product_id)
    if not product:
        return False

    await db.delete(product)
    await db.commit()
    return True
