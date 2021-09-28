import io

from fastapi.testclient import TestClient
from mypy_boto3_s3.client import S3Client

from app.config import config
from .utils import random_lower_string


def test_s3_create_evidence(authed_client: TestClient, s3_client: S3Client) -> None:
    s3_client.create_bucket(Bucket=config.S3_BUCKET)
    test_filename = 'test.jpg'

    file = io.BytesIO()
    title = random_lower_string()
    description = random_lower_string()
    rsp = authed_client.post(
        '/api/evidences',
        data={'title': title, 'description': description},
        files={'evidence_file': (test_filename, file)},
    )
    assert rsp.ok


def test_s3_get_evidence(authed_client: TestClient, s3_client: S3Client) -> None:
    s3_client.create_bucket(Bucket=config.S3_BUCKET)
    test_filename = 'test.jpg'
    test_file_content = b'test'
    test_file = io.BytesIO(test_file_content)

    title = random_lower_string()
    description = random_lower_string()
    rsp = authed_client.post(
        '/api/evidences',
        data={'title': title, 'description': description},
        files={'evidence_file': (test_filename, test_file)},
    )
    assert rsp.ok
    evidence_id = rsp.json()['id']

    rsp = authed_client.get(f'/api/evidences/{evidence_id}')
    assert rsp.ok
    assert rsp.content == test_file_content
