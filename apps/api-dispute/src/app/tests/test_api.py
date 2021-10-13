from fastapi.testclient import TestClient

from app.config import config
from app.utils.security import generate_signature


def test_healthcheck(client: TestClient) -> None:
    rsp = client.get('/api/health/app')
    assert rsp.ok


def test_ping_incorrect_signature(client: TestClient) -> None:
    rsp = client.post(
        '/api/events/ping',
        json={},
        headers={config.SIGNATURE_HEADER_NAME: 'incorrect-signature'},
    )
    assert not rsp.ok


def test_ping(client: TestClient) -> None:
    signature = generate_signature(config.MESSAGE_SECRET_KEY, b'{}')
    rsp = client.post(
        '/api/events/ping',
        json={},
        headers={config.SIGNATURE_HEADER_NAME: signature},
    )
    assert rsp.ok
