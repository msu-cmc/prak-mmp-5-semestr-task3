import os
from sqlalchemy.ext.asyncio import (
    AsyncAttrs, async_sessionmaker, create_async_engine
)
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy.pool import NullPool

from src.schemas.config import get_db_url


DATABASE_URL = os.getenv("DATABASE_URL", get_db_url())

engine = create_async_engine(DATABASE_URL, poolclass=NullPool)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class Base(AsyncAttrs, DeclarativeBase):

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """Имя таблицы в бд"""
        return f"{cls.__name__.lower()}s"
