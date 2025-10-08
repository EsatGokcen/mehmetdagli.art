from __future__ import annotations
import os, sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- Make sure "server/" is on sys.path so `import app` works ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
# ----------------------------------------------------------------

# import your app settings & models so metadata is populated
from app.core.config import settings
from app.db.base import Base
from app.db import models  # noqa: F401  (ensure models are imported)

# this is the Alembic Config object
config = context.config

# Configure logging from alembic.ini if present
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL  # use app settings directly
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Read the alembic.ini section and inject sqlalchemy.url
    ini_section = config.get_section(config.config_ini_section) or {}
    ini_section["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        ini_section,
        prefix="sqlalchemy.",           # <<< important
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()