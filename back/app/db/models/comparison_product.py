from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class ComparisonProduct(Base):
    __tablename__ = "comparison_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comparison_id = Column(
        Integer, ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )

    # Relaciones
    comparison = relationship("Comparison", back_populates="products")
    product = relationship("Product", back_populates="comparisons")

    def __repr__(self):
        return f"<ComparisonProduct(comparison_id={self.comparison_id}, product_id={self.product_id})>"
