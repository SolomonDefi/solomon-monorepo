import io
import typing
from contextlib import contextmanager
from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.utils.deps import get_storage
from .utils import random_lower_string
from .utils.evidence import create_random_evidence


def test_healthcheck(client: TestClient) -> None:
    rsp = client.get('/api/health/app')
    assert rsp.ok


def test_get_evidences(db: Session, authed_client: TestClient) -> None:
    num_evidence = 3
    for _ in range(num_evidence):
        create_random_evidence(db, owner_id=authed_client.user_id)
    rsp = authed_client.get('/api/evidences')
    assert rsp.ok
    data = rsp.json()
    assert len(data) == num_evidence


@contextmanager
def overrided_storage(authed_client: TestClient) -> typing.Generator:
    mocked_storage = MagicMock()
    authed_client.app.dependency_overrides[get_storage] = lambda: mocked_storage
    yield mocked_storage
    authed_client.app.dependency_overrides = {}


def test_create_evidence(authed_client: TestClient) -> None:
    test_filename = 'test.jpg'
    with overrided_storage(authed_client) as mocked_storage:
        mocked_storage.backend.name = 's3'
        mocked_storage.save.return_value = test_filename

        file = io.BytesIO()
        title = random_lower_string()
        description = random_lower_string()
        rsp = authed_client.post(
            '/api/evidences',
            data={'title': title, 'description': description},
            files={'evidence_file': (test_filename, file)},
        )
        assert rsp.ok


def test_get_evidence(authed_client: TestClient) -> None:
    test_filename = 'test.jpg'
    test_file_content = b'test'
    test_file = io.BytesIO()
    test_file.write(test_file_content)
    test_file.seek(0)

    with overrided_storage(authed_client) as mocked_storage:
        mocked_storage.backend.name = 's3'
        mocked_storage.save.return_value = test_filename
        mocked_storage.get.return_value = test_file

        file = io.BytesIO()
        title = random_lower_string()
        description = random_lower_string()
        rsp = authed_client.post(
            '/api/evidences',
            data={'title': title, 'description': description},
            files={'evidence_file': (test_filename, file)},
        )
        assert rsp.ok
        evidence_id = rsp.json()['id']

        rsp = authed_client.get(f'/api/evidences/{evidence_id}')
        assert rsp.ok
        assert rsp.content == test_file_content
