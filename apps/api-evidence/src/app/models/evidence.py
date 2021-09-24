from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User


class Evidence(Base):
    __tablename__ = 'evidences'

    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='items')
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    storage_backend = Column(String, nullable=False)
    file_key = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    created = Column(DateTime, nullable=False, default=datetime.utcnow)
