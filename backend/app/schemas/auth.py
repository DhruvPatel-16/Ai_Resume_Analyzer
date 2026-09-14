from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)

Token.model_rebuild()
