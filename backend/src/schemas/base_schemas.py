from typing import Any, List

from pydantic import BaseModel, Field


class PagePaginate(BaseModel):
    values: List[Any] = Field(default=None)
    total: int = Field(default=0)
    page: int = Field(default=0)
    pages: int = Field(default=0)
    page_size: int = Field(default=0)

    class Config:
        extra = "allow"
