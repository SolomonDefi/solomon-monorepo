import hmac
import typing

from fastapi import Request

from app.config import config
from app.db.session import SessionLocal
from app.utils.security import generate_signature


def get_db() -> typing.Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


class SignatureHeader:
    secret_key = config.MESSAGE_SECRET_KEY

    def is_valid_signature(self, signature: str, message: bytes) -> bool:
        return hmac.compare_digest(
            signature, generate_signature(self.secret_key, message)
        )

    async def __call__(self, request: Request) -> typing.Optional[dict]:
        signature = request.headers[config.SIGNATURE_HEADER_NAME]
        if not signature:
            return None
        message = await request.body()
        if not self.is_valid_signature(signature, message):
            return None
        return await request.json()
