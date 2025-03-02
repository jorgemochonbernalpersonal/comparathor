from logging.config import fileConfig
from sqlalchemy import create_engine
from alembic import context

# Importa la configuración de la BD
from app.core.config import DATABASE_URL

# Importa los modelos de SQLAlchemy
from app.db.database import Base
from app.db.models import user, role, product, comparison, rating

# Configuración de Alembic
config = context.config

# Configuración de logging en Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Se usa la metadata de los modelos para la autogeneración
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo offline.

    En este modo, se usa solo la URL de la base de datos sin crear un `Engine`.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecuta migraciones en modo online.

    En este modo, se crea un `Engine` y se establece una conexión con la BD.
    """
    connectable = create_engine(DATABASE_URL.replace("asyncpg", "psycopg2"))

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
