from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from app.utils.py_object_id import PyObjectId
from app.core.security import get_password_hash


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr = Field(...)
    password_hash: Optional[str] = None
    password: Optional[str] = Field(None, exclude=True)
    role_id: PyObjectId = Field(...)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
    )

    @model_validator(mode="before")
    def validate_password(cls, values):
        if "password" in values and values["password"]:
            values["password_hash"] = get_password_hash(values.pop("password"))
        return values

    def __str__(self):
        return f"User(id={self.id}, name={self.name}, email={self.email})"
