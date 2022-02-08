import typing

from fastapi import APIRouter, Depends, Body, status
from fastapi.exceptions import RequestValidationError
from pydantic.error_wrappers import ValidationError
from sqlalchemy.orm import Session

from app import schemas, models
from app.models import event_fixtures
from app.utils import deps


router = APIRouter()


@router.post(
    '/ping',
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(deps.signature_header)],
)
def ping() -> typing.Any:
    return ''


@router.post(
    '',
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(deps.signature_header)],
)
def handle_event(
    event: schemas.AllEvents = Body(
        ...,
        examples={
            "dispute.preorder.created": {
                "summary": "Preorder dispute created",
                "value": event_fixtures.DISPUTE_PREORDER_CREATED_VALID,
            },
            "dispute.preorder.completed": {
                "summary": "Preorder dispute completed",
                "value": event_fixtures.DISPUTE_PREORDER_COMPLETED_VALID,
            },
            "evidence.preorder.submitted": {
                "summary": "Evidence for preorder dispute submitted",
                "value": event_fixtures.EVIDENCE_PREORDER_SUBMITTED_VALID,
            },
            "payment.preorder.created": {
                "summary": "Payment for preorder created",
                "value": event_fixtures.PAYMENT_PREORDER_CREATED_VALID,
            },
        },
    ),
    db: Session = Depends(deps.get_db),
) -> typing.Any:
    try:
        models.Event.create(db, data=event)
    except ValidationError as e:
        raise RequestValidationError(e.raw_errors)
    return ''
