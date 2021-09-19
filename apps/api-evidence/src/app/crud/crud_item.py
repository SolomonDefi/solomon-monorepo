from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models import UploadItem
from app.schemas import UploadItemCreate, UploadItemUpdate


class CRUDItem(CRUDBase[UploadItem, UploadItemCreate, UploadItemUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: UploadItemCreate, owner_id: int
    ) -> UploadItem:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = UploadItem(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[UploadItem]:
        return (
            db.query(UploadItem)
            .filter(UploadItem.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


item = CRUDItem(UploadItem)
