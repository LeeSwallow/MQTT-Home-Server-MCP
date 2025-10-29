from pydantic import BaseModel, Field
from typing import Generic, List, TypeVar

T = TypeVar("T")
F = TypeVar("F")

class PageRequest(BaseModel):
    page: int = Field(description="페이지 번호", default=0)
    size: int = Field(description="페이지 크기", default=10) 

class PageResponse(BaseModel, Generic[T]):
    contents: List[T] = Field(description="페이지 내용")
    page: int = Field(description="페이지 번호")
    size: int = Field(description="페이지 크기")
    total_pages: int = Field(description="총 페이지 수")
    total_items: int = Field(description="총 아이템 수")
    
class DefaultEdit(BaseModel):
    name: str | None = Field(default=None, description="수정할 대상의 이름")
    description: str | None = Field(default=None, description="수정할 대상의 설명")