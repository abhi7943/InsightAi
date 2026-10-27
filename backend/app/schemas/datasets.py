from pydantic import BaseModel, Field
from typing import Any
from uuid import UUID
from datetime import datetime

class DatasetOut(BaseModel):
    id: UUID
    name: str
    source_filename: str
    row_count: int
    column_count: int
    created_at: datetime

class ChatRequest(BaseModel):
    question: str
    history: list[dict] = Field(default_factory=list)

class ChatResponse(BaseModel):
    answer: str
    sql: str
    columns: list[str]
    rows: list[list]
    chart: dict[str, Any] | None = None
