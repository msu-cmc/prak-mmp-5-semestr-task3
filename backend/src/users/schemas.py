import re
from typing import List, Optional, Union

from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ValidationInfo, field_validator

from src.schemas.config import Config as cfg

password_pattern = re.compile(r'^.{1,}$')


class UserRegister(BaseModel):
    email: EmailStr = Field(
        description="Электронная почта"
    )
    password: str = Field(
        min_length=1,
        max_length=50,
        description="Пароль, от 1 до 50 знаков"
    )
    fio: str = Field(
        description="ФИО"
    )
    role: str = Field(
        description="Роль"
    )

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        if not password_pattern.match(v):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Пароль должен содержать минимум 1 символ."
            )
        return v

    @field_validator("fio")
    def validate_fio(cls, v: str) -> str:
        if not re.match(r"^[A-Za-zА-Яа-я\s]*$", v):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="ФИО должно содержать только буквы и пробелы."
            )
        return v

    @field_validator("role")
    def validate_role(cls, v: str, info: ValidationInfo) -> str:
        if v not in cfg.UserRoles:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Недопустимая роль."
            )
        return v


class UserUpdate(UserRegister):
    email: Union[EmailStr, None] = Field(
        description="Почта",
        default=None
    )
    password: Union[str, None] = Field(
        min_length=1,
        max_length=50,
        description="Пароль, от 1 до 50 знаков",
        default=None
    )
    fio: Union[str, None] = Field(
        description="ФИО",
        default=None
    )
    role: Union[str, None] = Field(
        description="Роль",
        default=None
    )


class UserAuth(BaseModel):
    email: EmailStr = Field(
        description="Электронная почта"
    )
    password: str = Field(
        min_length=1,
        max_length=50,
        description="Пароль, от 1 до 50 знаков"
    )

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    fio: str
    role: str

class UsersResponse(BaseModel):
    values: List[UserResponse]
    total: int
    page: int
    pages: int
    page_size: int

class LoginResponse(BaseModel):
    id: int
    access_token: Optional[str] = None
