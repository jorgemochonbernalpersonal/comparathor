from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.utils.py_object_id import PyObjectId


class Product(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    metadata: Optional[dict]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )

    @model_validator(mode="before")
    def validate_price(cls, values):
        """
        Validación para asegurar que el precio es no negativo.
        """
        if "price" in values and values["price"] < 0:
            raise ValueError("Price must be a non-negative value")
        return values

    def __str__(self):
        return f"Product(id={self.id}, name={self.name}, price={self.price})"
