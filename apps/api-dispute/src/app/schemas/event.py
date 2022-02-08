import typing

from pydantic import BaseModel, Field, validator

from app.utils.typing import EthAddress


__all__ = [
    'EvidenceSubmittedEvent',
    'DisputeCreatedEvent',
    'DisputeCompletedEvent',
    'PaymentCreatedEvent',
    'AllEvents',
]


class BaseEvent(BaseModel):
    id: str
    type: str
    party1: EthAddress
    party2: EthAddress
    contract: EthAddress

    def to_dict(self, data=None):
        return {
            "message_id": self.id,
            **self.dict(include={'type', 'party1', 'party2', 'contract'}),
            **({"data": data} if data else {}),
        }


class DisputeCreatedEvent(BaseEvent):
    judgeContract: EthAddress

    def to_dict(self):
        return super().to_dict(data={"judgeContract": self.judgeContract})


class DisputeCompletedEvent(BaseEvent):
    judgeContract: EthAddress
    awardedTo: EthAddress

    @validator('awardedTo')
    def awardee_in_party(cls, awardee: EthAddress, values: dict) -> EthAddress:
        if awardee not in [values['party1'], values['party2']]:
            raise ValueError('awardee address do not match')
        return awardee

    def to_dict(self):
        return super().to_dict(
            data={
                "judgeContract": self.judgeContract,
                "awardedTo": self.awardedTo,
            }
        )


class EvidenceSubmittedEvent(BaseEvent):
    judgeContract: EthAddress
    evidenceUrl: str
    submitter: EthAddress

    @validator('submitter')
    def submitter_in_party(cls, submitter: EthAddress, values: dict) -> EthAddress:
        if submitter not in [values['party1'], values['party2']]:
            raise ValueError('submitter address do not match')
        return submitter

    def to_dict(self):
        return super().to_dict(
            data={
                "judgeContract": self.judgeContract,
                "evidenceUrl": self.evidenceUrl,
                "submitter": self.submitter,
            }
        )


class PaymentCreatedEvent(BaseEvent):
    judgeContract: EthAddress
    token: EthAddress
    discount: int = Field(..., ge=0, le=100)
    ethPaid: str

    def to_dict(self):
        return super().to_dict(
            data={
                "judgeContract": self.judgeContract,
                "evidenceUrl": self.evidenceUrl,
                "submitter": self.submitter,
            }
        )


AllEvents = (
    DisputeCreatedEvent
    | DisputeCompletedEvent
    | EvidenceSubmittedEvent
    | PaymentCreatedEvent
)
