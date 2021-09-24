from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.evidence import Evidence


class User(Base):
    __tablename__ = 'users'

    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    eth_address = Column(String, unique=True, index=True)
    challenge_hash = Column(String)
    challenge_expiry = Column(Integer, default=0)
    items = relationship('Evidence', back_populates='owner')
