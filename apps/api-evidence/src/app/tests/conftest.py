import os
import typing

import boto3
import pytest
from fastapi.testclient import TestClient
from moto import mock_s3
from mypy_boto3_s3.client import S3Client
from pydantic import PostgresDsn
from sqlalchemy import create_engine
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import Session

from app.config import config
from app.db.base import Base
from app.db.session import engine, SessionLocal
from main import app
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils import get_superuser_token_headers, random_email


def setup_db() -> None:
    try:
        conn = engine.connect()
        conn.execute('commit')
        conn.execute(f'drop database {config.TEST_DB}')
        conn.close()
    except ProgrammingError:
        pass

    try:
        conn = engine.connect()
        conn.execute('commit')
        conn.execute(f'create database {config.TEST_DB}')
        conn.close()
    except ProgrammingError:
        pass

    config.SQLALCHEMY_DATABASE_URI = PostgresDsn.build(
        scheme='postgresql',
        user=config.POSTGRES_USER,
        password=config.POSTGRES_PASSWORD,
        host=config.POSTGRES_SERVER,
        path=f'/{config.TEST_DB}',
    )
    test_engine = create_engine(config.SQLALCHEMY_DATABASE_URI)
    Base.metadata.create_all(test_engine)
    SessionLocal.configure(bind=test_engine)


@pytest.fixture(scope='session')
def db() -> typing.Generator:
    setup_db()
    yield SessionLocal()


@pytest.fixture(scope='session')
def client() -> typing.Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope='session')
def authed_client(
    normal_user_token_headers: tuple[dict[str, str], int]
) -> typing.Generator:
    with TestClient(app) as c:
        headers, user_id = normal_user_token_headers
        c.user_id = user_id
        c.headers.update(headers)
        yield c


@pytest.fixture
def aws_credentials() -> None:
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture
def s3_client(aws_credentials: typing.Any) -> typing.Generator[S3Client, None, None]:
    with mock_s3():
        if not config.S3_REGION:
            config.S3_REGION = 'us-east-1'
        conn = boto3.client("s3", region_name=config.S3_REGION)
        yield conn


@pytest.fixture(scope='session')
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope='session')
def normal_user_token_headers(
    client: TestClient, db: Session
) -> tuple[dict[str, str], int]:
    return authentication_token_from_email(client=client, email=random_email(), db=db)
