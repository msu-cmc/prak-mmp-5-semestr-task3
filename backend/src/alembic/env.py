import os, urllib.parse
from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from src.database.database import Base
from src.schemas.config import settings
# from src.database.models import User
from src.database import models

config = context.config
target_metadata = Base.metadata

def build_db_url() -> str:
    user = settings.DB_USER
    pwd = urllib.parse.quote_plus(settings.DB_PASSWORD)
    host = settings.DB_HOST
    port = settings.DB_PORT
    name = settings.DB_NAME
    return f"postgresql+asyncpg://{user}:{pwd}@{host}:{port}/{name}"

def _configure_and_run(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_offline():
    context.configure(url=build_db_url(), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    config.set_main_option("sqlalchemy.url", build_db_url())
    engine = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with engine.connect() as conn:
        await conn.run_sync(_configure_and_run)

if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())
