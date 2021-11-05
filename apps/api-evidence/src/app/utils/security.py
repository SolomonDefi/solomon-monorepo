from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

from cryptography.hazmat.primitives import hashes, hmac
from eth_account import Account
from eth_account.messages import encode_structured_data
from eth_utils import decode_hex, to_checksum_address
from fastapi.exceptions import HTTPException
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.status import HTTP_401_UNAUTHORIZED

from app import crud, schemas
from app.config import config


def create_access_token(
    token_payload: schemas.TokenPayload, expires_delta: timedelta = None
) -> schemas.Token:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": token_payload.sub}
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY)
    return schemas.Token(access_token=encoded_jwt)


class EmailPassword:
    pwd_context: CryptContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def verify(self, password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(password, hashed_password)

    def hash(self, password: str) -> str:
        return self.pwd_context.hash(password)


class AddressHeaderAuth:
    chain_id: int = config.CHAIN_ID

    def challenge_from_hash(self, hash: str) -> dict:
        return {
            "domain": {
                "chainId": self.chain_id,
                "name": "Solomon DeFi",
                "version": "1",
            },
            "message": {
                "label": "Sign this message to authenticate",
                "contents": hash,
            },
            "primaryType": "Auth",
            "types": {
                "EIP712Domain": [
                    {"name": "name", "type": "string"},
                    {"name": "version", "type": "string"},
                    {"name": "chainId", "type": "uint256"},
                ],
                "Auth": [
                    {"name": "contents", "type": "string"},
                    {"name": "label", "type": "string"},
                ],
            },
        }

    def create_challenge(self, db: Session, eth_address: str) -> dict:
        checksum_address = to_checksum_address(eth_address)
        hash = hmac.HMAC(uuid4().bytes, hashes.SHA256())
        hash.update(f"{checksum_address}{uuid4().hex}".encode())
        challenge_hash = hash.finalize().hex()
        challenge_expiry = int(datetime.utcnow().timestamp() + config.CHALLENGE_TTL)
        challenge = self.challenge_from_hash(challenge_hash)
        address_user_challenge = schemas.AddressUserChallenge(
            eth_address=checksum_address,
            challenge_hash=challenge_hash,
            challenge_expiry=challenge_expiry,
        )
        crud.user.challenge_address_user(db, challenge=address_user_challenge)
        return challenge

    def is_valid_challenge(
        self, address: str, challenge_hash: str, signature: str
    ) -> bool:
        data = self.challenge_from_hash(challenge_hash)
        signature_hex = decode_hex(signature)
        recovered_address = Account.recover_message(
            encode_structured_data(data), signature=signature_hex
        )
        return to_checksum_address(address) == recovered_address

    def __call__(self, request: Request) -> Optional[str]:
        auth_header = request.headers["authorization"]
        if not auth_header:
            return None
        auth_data = auth_header.split()
        if len(auth_data) != 4 or auth_data.pop(0) != "Challenge":
            raise HTTPException(HTTP_401_UNAUTHORIZED)
        address, challenge_hash, signature = auth_data
        if not self.is_valid_challenge(address, challenge_hash, signature):
            raise HTTPException(HTTP_401_UNAUTHORIZED)
        return address
