from pydantic import BaseModel, EmailStr, Field, condecimal
from datetime import datetime
from typing import Optional, List


# 📌 Modelos de Usuario
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr = Field(...)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None)
    email: Optional[EmailStr] = Field(None)
    password: Optional[str] = Field(
        None, min_length=6, max_length=100
    )  # 🔹 Agregada validación


class UserResponse(BaseModel):
    id: int = Field(..., description="ID único del usuario")
    name: str
    email: str
    role: str  # 👈 Asegurar que aquí es un string, no un objeto Role
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permite mapear desde SQLAlchemy

# 📌 Modelos de Roles
class RoleBase(BaseModel):
    role: str = Field(..., min_length=2, max_length=50)


class RoleResponse(RoleBase):
    id: int = Field(...)


class RoleCreate(RoleBase):
    pass


# 📌 Modelos de Producto
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=50)
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    description: Optional[str] = Field(None, max_length=500)
    brand: Optional[str] = Field(None, min_length=2, max_length=50)
    model: Optional[str] = Field(None, min_length=2, max_length=50)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int = Field(...)
    image_url: Optional[str] = Field(None)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    ratings: List["RatingResponse"] = Field(default_factory=list)  # ✅ Sin ForwardRef
    average_rating: Optional[float] = Field(None)
    total_ratings: Optional[int] = Field(0)


# 📌 Modelos de Comparación
class ComparisonBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None)


class ComparisonResponse(ComparisonBase):
    id: int = Field(...)
    created_at: datetime = Field(...)
    products: List[ProductResponse] = Field(default_factory=list)


# 📌 Modelos de Calificación
class RatingBase(BaseModel):
    product_id: int = Field(...)
    user_id: int = Field(...)
    rating: condecimal(
        ge=1, le=5, max_digits=2, decimal_places=1
    )  # ✅ Mejor validación
    comment: Optional[str] = Field(None, max_length=500)


class RatingCreate(RatingBase):
    pass


class RatingResponse(RatingBase):
    id: int = Field(...)
    created_at: datetime = Field(...)


# 📌 Modelos de Token y Autenticación
class TokenResponse(BaseModel):
    access_token: str = Field(...)
    refresh_token: str = Field(...)
    token_type: str = Field(...)
    user: Optional[UserResponse] = Field(None)


class UserLogin(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6, max_length=100)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(...)
