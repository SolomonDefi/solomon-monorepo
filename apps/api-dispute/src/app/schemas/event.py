import typing

from pydantic import BaseModel, Field, validator

from app.utils.typing import EthAddress


__all__ = [
    'EventIn',
    'EvidenceSubmittedEvent',
    'DisputeCreatedEvent',
    'DisputeCompletedEvent',
    'PaymentCreatedEvent',
    'EventCreate',
]


class BaseEvent(BaseModel):
    type: str
    party1: EthAddress
    party2: EthAddress
    contract: EthAddress


class EventIn(BaseEvent):
    id: str

    def to_common_dict(self) -> dict[str, typing.Any]:
        return self.dict(include={'message_id', 'type', 'party1', 'party2', 'contract'})


class DisputeCreatedEvent(EventIn):
    judgeContract: EthAddress


class DisputeCompletedEvent(EventIn):
    judgeContract: EthAddress
    awardedTo: EthAddress

    @validator('awardedTo')
    def awardee_in_party(cls, awardee: EthAddress, values: dict) -> EthAddress:
        if awardee not in [values['party1'], values['party2']]:
            raise ValueError('awardee address do not match')
        return awardee


class EvidenceSubmittedEvent(EventIn):
    judgeContract: EthAddress
    evidenceUrl: str
    submitter: EthAddress

    @validator('submitter')
    def submitter_in_party(cls, submitter: EthAddress, values: dict) -> EthAddress:
        if submitter not in [values['party1'], values['party2']]:
            raise ValueError('submitter address do not match')
        return submitter


class PaymentCreatedEvent(EventIn):
    judgeContract: EthAddress
    token: EthAddress
    discount: int = Field(..., ge=0, le=100)
    ethPaid: str


class EventCreate(BaseEvent):
    message_id: str
    data: str
