import typing

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.utils import deps, event_schema_class


router = APIRouter()


@router.post('/ping', status_code=status.HTTP_200_OK)
def ping(
    message: typing.Optional[typing.Any] = Depends(deps.SignatureHeader()),
) -> typing.Any:
    if message is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return ''


@router.post('', status_code=status.HTTP_200_OK)
def handle_event(
    db: Session = Depends(deps.get_db),
    data: typing.Optional[dict] = Depends(deps.SignatureHeader()),
) -> typing.Any:
    if data is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    event_type = data.get('type')
    if event_type is None or len(event_type.split('.')) != 3:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)

    event_schema = getattr(schemas, event_schema_class(event_type))
    message: schemas.EventIn = event_schema(**data)
    event = schemas.EventCreate(
        **message.to_common_dict(), message_id=message.id, data=message.json()
    )
    models.Event.create(db, data=event)
    return ''
