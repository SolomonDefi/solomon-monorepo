from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models import Evidence
from app.schemas import EvidenceCreate, EvidenceUpdate


class CRUDEvidence(CRUDBase[Evidence, EvidenceCreate, EvidenceUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: EvidenceCreate, owner_id: int
    ) -> Evidence:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Evidence(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[Evidence]:
        return (
            db.query(Evidence)
            .filter(Evidence.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


evidence = CRUDEvidence(Evidence)
