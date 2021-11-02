from sqlalchemy.orm import Session

from app import schemas  # noqa: F401
from app.config import config  # noqa: F401
from app.db import base  # noqa: F401

# Import all SQLAlchemy models (app.db.base) before initializing DB


def init_db(db: Session) -> None:
    # Tables created with Alembic migrations

    pass
