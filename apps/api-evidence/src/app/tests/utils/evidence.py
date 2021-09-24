import random
from typing import Optional

from sqlalchemy.orm import Session

from app import crud, models
from app.config import config
from app.schemas.evidence import EvidenceCreate
from app.tests.utils.user import create_random_user
from app.tests.utils import random_lower_string


def generate_content_type() -> str:
    return random.choice(config.ALLOWED_FILE_TYPES)


def create_random_evidence(
    db: Session, *, owner_id: Optional[int] = None
) -> models.Evidence:
    if owner_id is None:
        user, _ = create_random_user(db)
        owner_id = user.id
    title = random_lower_string()
    description = random_lower_string()
    evidence = EvidenceCreate(
        title=title,
        description=description,
        storage_backend='s3',
        file_key=random_lower_string(),
        media_type=generate_content_type(),
    )
    return crud.evidence.create_with_owner(db=db, obj_in=evidence, owner_id=owner_id)
