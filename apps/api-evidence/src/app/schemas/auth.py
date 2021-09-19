from pydantic import BaseModel

from app.utils.types import EthAddress


class AddressChallengeCreate(BaseModel):
    address: EthAddress


class AddressChallenge(BaseModel):
    challenge: dict
