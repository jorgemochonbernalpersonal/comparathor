from sqlalchemy import Column, Integer, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="ratings")
    product = relationship("Product", back_populates="ratings")

    def __repr__(self):
        return f"<Rating(id={self.id}, user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})>"
