from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from exceptions import invalid_db_excpetion
import os


def get_db_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if url is None:
        raise invalid_db_excpetion
    if url.startswith("postgres://"):
        # SQLAlchemy requires the URL to start with postgresql://, some web hosts, like Aiven, provides it starting with postgres:// by default, so we replace it here.
        # This should introduce no issues as both are valid URLs for PostgreSQL.
        url = url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = get_db_url()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
