import os
from enum import Enum
from typing import Self

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_INTERNAL_ENDPOINT: str
    MINIO_PUBLIC_ENDPOINT: str
    MINIO_REGION_NAME: str = "us-east-1"
    OPENAI_API_KEY: str
    @staticmethod
    def get_env_file() -> str:
        if env_file := os.getenv('ENV_FILE'):
            return os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "../..", env_file
            )
        return os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "../..", ".env"
        )

    model_config = SettingsConfigDict(env_file=get_env_file())


settings = Settings()


def get_db_url() -> str:
    return (
        f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@"
        f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    )


def get_auth_secrets() -> dict:
    return {"secret_key": settings.SECRET_KEY, "algorithm": settings.ALGORITHM}


class Config:
    _instance = None

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    class UserRoles(str, Enum):
        ADMIN = "admin"

    class MinioBuckets(str, Enum):
        TEST = "test"


cfg = Config()