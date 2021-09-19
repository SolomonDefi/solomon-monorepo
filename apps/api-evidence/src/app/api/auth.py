from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, schemas
from app.utils import deps, security

router = APIRouter()
address_auth = security.AddressHeaderAuth()


@router.post('/email', response_model=schemas.Token)
def email_login(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> schemas.Token:
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    return security.create_access_token(schemas.TokenPayload(sub=str(user.id)))


@router.post('/address-challenge', response_model=schemas.AddressChallenge)
def address_challenge(
    address_in: schemas.AddressChallengeCreate, db: Session = Depends(deps.get_db)
) -> schemas.AddressChallenge:
    challenge = address_auth.create_challenge(db, address_in.address)
    return schemas.AddressChallenge(challenge=jsonable_encoder(challenge))


@router.post('/address', response_model=schemas.Token)
def address_login(
    db: Session = Depends(deps.get_db),
    address: Optional[str] = Depends(address_auth),
) -> schemas.Token:
    if address is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    user = crud.user.get_by_eth_address(db, eth_address=address)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    if user.challenge_expiry > datetime.now().timestamp():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Challenge expired',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    return security.create_access_token(schemas.TokenPayload(sub=str(user.id)))
