from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.base import BaseDAO
from src.database.models import User, UserType
from src.schemas.base_schemas import PagePaginate
from src.database.session_manager import SessionManager
from src.users.schemas import UserRegister, UserUpdate
from sqlalchemy.orm import joinedload, selectinload


class UsersDAO(BaseDAO[User]):
    model = User
    options = [
        selectinload(User.parameter),
        selectinload(User.user_types).selectinload(UserType.type)  # <-- атрибут, а не класс
    ]

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def create_user(
        cls,
        user_data: UserRegister,
        user_dict: dict,
        session: AsyncSession = None
    ) -> User:
        return await cls.create(
            session=session,
            **user_dict
        )

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def update_user(
        cls,
        session: AsyncSession,
        user_id: int,
        user_data: UserUpdate,
        user_dict: dict
    ) -> None:
        await UsersDAO.update(
            session=session,
            id=user_id,
            **user_dict
        )

    @classmethod
    @SessionManager.with_session(auto_commit=False)
    async def user_paginate(
        cls,
        session: AsyncSession,
        page: int = 1,
        page_size: int = -1,
        search_query: Optional[str] = None,
        search_fields: Optional[list] = None,
        alphabet_sort: bool = True,
        **filters: Any
    ) -> PagePaginate:
        query = select(cls.model)

        if alphabet_sort:
            query = query.order_by(func.lower(cls.model.fio))
        else:
            query = query.order_by(desc(func.lower(cls.model.fio)))

        search_query = search_query if search_query else None

        return await super().paginate(
            session=session,
            page=page,
            page_size=page_size,
            search_query=search_query,
            search_fields=search_fields,
            base_query=query,
            **{k: v for k, v in filters.items() if v is not None}
        )

    @classmethod
    @SessionManager.with_session(auto_commit=False)
    async def get_user_by_email(
        cls,
        session: AsyncSession,
        email: str
    ) -> User:
        users = (await UsersDAO.paginate(
            session=session,
            email=email
        )).values
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не существует"
            )
        return users[0]