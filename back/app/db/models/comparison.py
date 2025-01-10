from pydantic import BaseModel, Field
from typing import List, Optional


class Comparison(BaseModel):
    id: Optional[str] = Field(alias="_id")
    title: str
    description: Optional[str]
    products: List[str] 
