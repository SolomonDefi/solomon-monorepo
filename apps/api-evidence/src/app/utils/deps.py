from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import config
from app.db.session import SessionLocal
from app.storage import Encryption, Storage, StorageBackend

token_auth = OAuth2PasswordBearer(tokenUrl="/api/auth/email")


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_s3_backend() -> StorageBackend:
    from app.storage.backend.s3 import S3

    if config.S3_REGION is None or config.S3_KEY is None or config.S3_SECRET is None:
        raise ValueError('S3 is not configured')

    return S3(
        config.S3_REGION,
        config.S3_KEY,
        config.S3_SECRET,
        config.S3_BUCKET,
        endpoint=config.S3_ENDPOINT,
    )


def get_encryption() -> Encryption:
    from app.storage.security import FernetEncryption

    return FernetEncryption(config.FILE_ENCRYPTION_KEY.encode('utf-8'))


def get_storage(
    backend: StorageBackend = Depends(get_s3_backend),
    encryption: Encryption = Depends(get_encryption),
) -> Storage:
    return Storage(backend, encryption)


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(token_auth)
) -> models.User:
    try:
        payload = jwt.decode(token, config.SECRET_KEY)
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    user = crud.user.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing privileges"
        )
    return current_user
