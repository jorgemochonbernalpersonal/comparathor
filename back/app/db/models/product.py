from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    comparisons = relationship(
        "ComparisonProduct", back_populates="product", cascade="all, delete-orphan"
    )

    # Relación con ratings
    ratings = relationship(
        "Rating", back_populates="product", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, category={self.category})>"
