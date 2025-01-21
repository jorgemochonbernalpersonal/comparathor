from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional
from datetime import datetime
from app.utils.py_object_id import PyObjectId


class Role(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., min_length=3, max_length=50, description="Nombre del rol")
    description: Optional[str] = Field(None, description="Descripción del rol")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )

    def __str__(self):
        return f"Role(id={self.id}, name={self.name})"

