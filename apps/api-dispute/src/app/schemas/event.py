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

    @validator('type')
    def valid_type(cls, type: str, values: dict) -> str:
        if type in [
            'dispute.preorder.created',
            'dispute.preorder.completed',
            'evidence.preorder.submitted',
            'payment.preorder.created',
        ]:
            return type
        raise ValueError('Invalid type')

    # TODO -- this should be handled by a decorator
    # Currently it's done this way to ensure validation order
    def validate_parties(values: dict):
        parties = [values.get('party1'), values.get('party2')]
        if not parties[0] or not parties[1]:
            raise ValueError('a party is missing or invalid')
        return parties

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
        parties = cls.validate_parties(values)
        if awardee not in parties:
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
        parties = cls.validate_parties(values)
        if submitter not in parties:
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
                "token": self.token,
                "discount": self.discount,
                "ethPaid": self.ethPaid,
            }
        )


AllEvents = (
    PaymentCreatedEvent
    | DisputeCompletedEvent
    | EvidenceSubmittedEvent
    | DisputeCreatedEvent
)
