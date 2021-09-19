from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User


class UploadItem(Base):
    __tablename__ = 'upload_items'

    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='items')
