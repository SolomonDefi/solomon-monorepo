import typing
from datetime import datetime

from sqlalchemy import Column, DateTime, JSON, String
from sqlalchemy.orm import Session

from app import schemas
from app.db.base_class import Base


class Event(Base):
    __tablename__ = 'events'

    message_id = Column(String(36), unique=True, index=True)
    type = Column(String)
    party1 = Column(String(42), index=True)
    party2 = Column(String(42), index=True)
    contract = Column(String(42))
    data = Column(JSON)
    created = Column(DateTime, default=datetime.utcnow)

    @staticmethod
    def get(db: Session, id: typing.Any) -> typing.Optional['Event']:
        return db.query(Event).get(id)

    @staticmethod
    def create(db: Session, *, data: schemas.AllEvents) -> 'Event':
        event = Event(**data.to_dict())
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
