from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import config
from app.storage import Storage
from app.utils import deps, types

router = APIRouter()


@router.get('', response_model=list[schemas.Evidence])
def get_evidence_list(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve evidence.
    """
    if current_user.is_superuser:
        evidence = crud.evidence.get_multi(db, skip=skip, limit=limit)
    else:
        evidence = crud.evidence.get_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return evidence


@router.post('', response_model=schemas.Evidence)
def create_evidence(
    db: Session = Depends(deps.get_db),
    storage: Storage = Depends(deps.get_storage),
    current_user: models.User = Depends(deps.get_current_active_user),
    title: str = Form(...),
    description: str = Form(...),
    evidence_file: types.EvidenceFile = File(...),
) -> Any:
    """
    Create new evidence.
    """
    file_key = storage.save(evidence_file.filename, evidence_file.file)

    evidence_in = schemas.EvidenceCreate(
        title=title,
        description=description,
        storage_backend=storage.backend.name,
        file_key=file_key,
        media_type=evidence_file.content_type,
    )
    evidence = crud.evidence.create_with_owner(
        db=db, obj_in=evidence_in, owner_id=current_user.id
    )
    return evidence


@router.get(
    '/{id}',
    response_class=StreamingResponse,
    responses={
        400: {'description': 'Evidence expired'},
        403: {'description': 'Not enough permissions'},
        404: {},
    },
)
def get_evidence(
    id: int,
    db: Session = Depends(deps.get_db),
    storage: Storage = Depends(deps.get_storage),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get evidence by ID.
    """
    evidence = crud.evidence.get(db=db, id=id)

    if evidence is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if not current_user.is_superuser and evidence.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail='Not enough permissions'
        )
    if evidence.created + timedelta(days=config.MAX_FILE_TTL) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='Evidence expired'
        )

    return StreamingResponse(
        storage.get(evidence.file_key), media_type=evidence.media_type
    )
