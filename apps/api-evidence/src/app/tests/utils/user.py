from eth_account import Account
from eth_account.messages import encode_structured_data
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import config
from app.tests.utils import random_email, random_lower_string


def user_authentication_headers(
    *, client: TestClient, email: str, password: str
) -> dict[str, str]:
    data = {"username": email, "password": password}

    r = client.post(f"{config.API_PREFIX}/login/access-token", data=data)
    response = r.json()
    auth_token = response["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def create_random_user(db: Session) -> tuple[models.User, str]:
    email = random_email()
    password = random_lower_string()
    user_in = schemas.UserCreate(username=email, email=email, password=password)
    user = crud.user.create(db=db, obj_in=user_in)
    return user, password


def create_random_wallet() -> tuple[str, bytes]:
    account = Account.create()
    return account.address, account.key


def eth_sign_data(challenge: dict, private_key: bytes) -> str:
    message = encode_structured_data(challenge)
    signed_message = Account.sign_message(message, private_key)
    return signed_message.signature.hex()


def authentication_token_from_email(
    *, client: TestClient, email: str, db: Session
) -> dict[str, str]:
    """
    Return a valid token for the user with given email.

    If the user doesn't exist it is created first.
    """
    password = random_lower_string()
    user = crud.user.get_by_email(db, email=email)
    if not user:
        user_in_create = schemas.UserCreate(
            username=email, email=email, password=password
        )
        user = crud.user.create(db, obj_in=user_in_create)
    else:
        user_in_update = schemas.UserUpdate(password=password)
        user = crud.user.update(db, db_obj=user, obj_in=user_in_update)

    return user_authentication_headers(client=client, email=email, password=password)
