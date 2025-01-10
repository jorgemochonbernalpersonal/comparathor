from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from app.db.dependencies import get_db
from app.db.models.product import Product

router = APIRouter()


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: Product, db=Depends(get_db)):
    now = datetime.now(timezone.utc)
    product.created_at = now
    product.updated_at = now
    product_dict = product.model_dump(by_alias=True, exclude={"id"})
    result = await db["products"].insert_one(product_dict)
    product.id = str(result.inserted_id)
    return product


@router.get("/", response_model=List[Product], status_code=status.HTTP_200_OK)
async def list_products(db=Depends(get_db)):
    products = await db["products"].find().to_list(100)
    return [Product(**{**product, "id": str(product["_id"])}) for product in products]


@router.get("/{product_id}", response_model=Product, status_code=status.HTTP_200_OK)
async def get_product(product_id: str, db=Depends(get_db)):
    """
    Endpoint para obtener un producto por su ID.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID"
        )

    product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    return Product(**{**product, "id": str(product["_id"])})


@router.put("/{product_id}", response_model=Product, status_code=status.HTTP_200_OK)
async def update_product(product_id: str, product: Product, db=Depends(get_db)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    existing_product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    product.updated_at = datetime.now(timezone.utc)
    updated_data = product.model_dump(by_alias=True, exclude={"id", "created_at"})
    await db["products"].update_one(
        {"_id": ObjectId(product_id)}, {"$set": updated_data}
    )
    updated_product = await db["products"].find_one({"_id": ObjectId(product_id)})
    return Product(**{**updated_product, "id": str(updated_product["_id"])})


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db=Depends(get_db)):
    """
    Endpoint para eliminar un producto por su ID.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID"
        )

    delete_result = await db["products"].delete_one({"_id": ObjectId(product_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
