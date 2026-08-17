from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.config import get_settings

settings = get_settings()

database_url = settings.database_url
if database_url.startswith("postgresql://") and "+psycopg" not in database_url and "+psycopg2" not in database_url:
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Supabase session mode (5432) caps at ~15 clients and was failing Analyze.
# Transaction mode (6543) + NullPool is the supported SQLAlchemy setup.
if "pooler.supabase.com:5432" in database_url:
    database_url = database_url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543", 1)

is_postgres = "postgresql" in database_url
uses_transaction_pooler = is_postgres and ":6543" in database_url

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif uses_transaction_pooler:
    connect_args = {"prepare_threshold": None}
else:
    connect_args = {}

if not is_postgres:
    engine = create_engine(database_url, connect_args=connect_args)
else:
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        poolclass=NullPool,
        pool_pre_ping=True,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Keep FastAPI tables off the UUID schema already in public (supabase/schema.sql).
if not database_url.startswith("sqlite"):
    Base.metadata.schema = "sukhad"

# Photo + official-page links added after the first create_all.
OPTIONAL_COLUMNS = [
    ("attractions", "image", "VARCHAR(1000)"),
    ("attractions", "website_url", "VARCHAR(1000)"),
    ("hotels", "image", "VARCHAR(1000)"),
    ("hotels", "website_url", "VARCHAR(1000)"),
    ("food_spots", "image", "VARCHAR(1000)"),
    ("food_spots", "website_url", "VARCHAR(1000)"),
    ("local_scams", "image", "VARCHAR(1000)"),
    ("local_scams", "website_url", "VARCHAR(1000)"),
    ("emergency_service_items", "website_url", "VARCHAR(1000)"),
    ("mmr_areas", "image", "VARCHAR(1000)"),
    ("mmr_areas", "website_url", "VARCHAR(1000)"),
    ("mmr_area_spots", "image", "VARCHAR(1000)"),
    ("mmr_area_spots", "website_url", "VARCHAR(1000)"),
    ("smart_itineraries", "image", "VARCHAR(1000)"),
    ("attractions", "latitude", "DOUBLE PRECISION"),
    ("attractions", "longitude", "DOUBLE PRECISION"),
    ("hotels", "latitude", "DOUBLE PRECISION"),
    ("hotels", "longitude", "DOUBLE PRECISION"),
    ("food_spots", "latitude", "DOUBLE PRECISION"),
    ("food_spots", "longitude", "DOUBLE PRECISION"),
    ("emergency_service_items", "image", "VARCHAR(1000)"),
    ("emergency_service_items", "latitude", "DOUBLE PRECISION"),
    ("emergency_service_items", "longitude", "DOUBLE PRECISION"),
    ("users", "google_sub", "VARCHAR(128)"),
    ("users", "password_hash", "VARCHAR(255)"),
]


def prepare_database() -> None:
    if engine.dialect.name != "sqlite":
        with engine.begin() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS sukhad"))
    Base.metadata.create_all(bind=engine)
    ensure_optional_columns()


def ensure_optional_columns() -> None:
    """Add columns introduced after the first create_all."""
    schema = Base.metadata.schema
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            for table, column, coltype in OPTIONAL_COLUMNS:
                cols = {row[1] for row in conn.execute(text(f"PRAGMA table_info({table})"))}
                if column not in cols:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}"))
        else:
            for table, column, coltype in OPTIONAL_COLUMNS:
                qualified = f"{schema}.{table}" if schema else table
                conn.execute(text(
                    f"ALTER TABLE {qualified} ADD COLUMN IF NOT EXISTS {column} {coltype}"
                ))
        if engine.dialect.name != "sqlite":
            users = f"{schema}.users" if schema else "users"
            conn.execute(text(f"ALTER TABLE {users} ALTER COLUMN phone_number DROP NOT NULL"))
            conn.execute(text(f"CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_sub ON {users} (google_sub)"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
