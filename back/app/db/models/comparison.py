from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "title", name="uq_user_comparison_title"),
    )

    user = relationship("User", back_populates="comparisons")
    products = relationship(
        "ComparisonProduct", back_populates="comparison", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Comparison(id={self.id}, title={self.title}, user_id={self.user_id})>"
