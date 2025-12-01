from typing import Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.authorization import UserDependency, auth
from src.schemas.config import Config as cfg
from src.database.models import User
from src.schemas.base_schemas import PagePaginate
from src.users.dao import UsersDAO
from src.users.schemas import (
    LoginResponse,
    UserAuth,
    UserRegister,
    UserResponse,
    UserUpdate,
    UsersResponse
)
from src.users.utils import prepare_user_data


user_router = APIRouter(prefix='/api/users', tags=['Users'])


@user_router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserRegister,
    #_=Depends(UserDependency([cfg.UserRoles.ADMIN]))  # noqa
) -> User:
    user_dict = prepare_user_data(user_data)
    user = await UsersDAO.create_user(user_data, user_dict)
    return await UsersDAO.get(id=user.id)


@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    #_=UserDependency([cfg.UserRoles.ADMIN])  # noqa
) -> User:
    user_dict = prepare_user_data(user_data)
    await UsersDAO.update_user(
        user_id=user_id,
        user_data=user_data,
        user_dict=user_dict
    )
    return await UsersDAO.get(id=user_id)


@user_router.get("/", response_model=UsersResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(-1, ge=-1, le=100, description="Количество на странице"),
    query: Optional[str] = Query(None, description="Поиск по ФИО"),
    role: Optional[str] = Query(None, description="Фильтр по роли"),
    alphabet_sort: Optional[bool] = Query(
        True, description="True — по алфавиту, False — в обратном порядке"
    )
) -> PagePaginate:
    return await UsersDAO.user_paginate(
        page=page,
        page_size=page_size,
        include_nullable=False,
        search_query=query,
        search_fields=['fio'],
        role=role,
        alphabet_sort=alphabet_sort
    )


@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    #_=Depends(auth.is_admin_or_self)  # noqa
) -> User:
    return await UsersDAO.get(id=user_id)


@user_router.delete("/{user_id}", response_model=UserResponse)
async def delete_user(
    user_id: int,
    #_=UserDependency([cfg.UserRoles.ADMIN])  # noqa
) -> User:
    user = await UsersDAO.get(id=user_id)
    await UsersDAO.delete(id=user_id)
    return user

auth_router = APIRouter(prefix='/api/auth', tags=['Auth'])

@auth_router.options("/login")
async def options_login() -> dict:
    return {}

@auth_router.post("/login", response_model=LoginResponse)
async def auth_user(
        user_data: UserAuth
) -> dict:
    user = await UsersDAO.get_user_by_email(email=user_data.email)
    auth.verify_password(plain_password=user_data.password, hashed_password=user.password)
    access_token = auth.create_access_token({"sub": str(user.id)})
    return {'id': user.id, 'access_token': access_token}
