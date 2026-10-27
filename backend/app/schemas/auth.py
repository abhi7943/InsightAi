from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    company_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    role: str
    company_id: UUID
    company_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
