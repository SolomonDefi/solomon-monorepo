import hmac
import typing

from fastapi import HTTPException, status, Header, Request

from app.config import config
from app.db.session import SessionLocal
from app.utils.security import generate_signature
from app.models import event_fixtures


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

    async def __call__(
        self,
        request: Request,
        X_Signature: str = Header(
            ...,
            examples={
                "dispute.preorder.created": {
                    "summary": "Preorder dispute created signature",
                    "value": event_fixtures.DISPUTE_PREORDER_CREATED_VALID_SIGNATURE,
                },
                "dispute.preorder.completed": {
                    "summary": "Preorder dispute completed signature",
                    "value": event_fixtures.DISPUTE_PREORDER_COMPLETED_VALID_SIGNATURE,
                },
                "evidence.preorder.submitted": {
                    "summary": "Evidence for preorder dispute submitted signature",
                    "value": event_fixtures.EVIDENCE_PREORDER_SUBMITTED_VALID_SIGNATURE,
                },
                "payment.preorder.created": {
                    "summary": "Payment for preorder created signature",
                    "value": event_fixtures.PAYMENT_PREORDER_CREATED_VALID_SIGNATURE,
                },
            },
        ),
    ):
        if not X_Signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='X-Signature header missing',
            )
        body = await request.body()
        if not self.is_valid_signature(X_Signature, body):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='X-Signature header invalid',
            )
        return None


signature_header = SignatureHeader()
