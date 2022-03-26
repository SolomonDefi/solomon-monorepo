from json import dumps

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import config
from app.utils.security import generate_signature
from app.models.event_fixtures import (
    DISPUTE_PREORDER_CREATED_VALID,
    DISPUTE_PREORDER_CREATED_INVALID,
    DISPUTE_PREORDER_COMPLETED_VALID,
    EVIDENCE_PREORDER_SUBMITTED_VALID,
    PAYMENT_PREORDER_CREATED_VALID,
)


def test_healthcheck(client: TestClient) -> None:
    rsp = client.get('/api/health/app')
    assert rsp.ok


def test_ping_incorrect_signature(client: TestClient) -> None:
    rsp = client.post(
        '/api/events/ping',
        json={},
        headers={'X-Signature': 'incorrect-signature'},
    )
    assert not rsp.ok


def test_ping(client: TestClient) -> None:
    signature = generate_signature(config.MESSAGE_SECRET_KEY, b'{}')
    rsp = client.post(
        '/api/events/ping',
        json={},
        headers={'X-Signature': signature},
    )
    assert rsp.ok


event_data_ids = [
    "valid_dispute_created",
    "fail_dispute_created",
    "valid_dispute_completed",
    "valid_evidence_submitted",
    "valid_payment_created",
]
event_data: list[tuple[dict, bool]] = [
    (DISPUTE_PREORDER_CREATED_VALID, True),
    (DISPUTE_PREORDER_CREATED_INVALID, False),
    (DISPUTE_PREORDER_COMPLETED_VALID, True),
    (EVIDENCE_PREORDER_SUBMITTED_VALID, True),
    (PAYMENT_PREORDER_CREATED_VALID, True),
]


@pytest.mark.parametrize("message,expected", event_data, ids=event_data_ids)
def test_events(db: Session, client: TestClient, message: dict, expected: bool) -> None:
    signature = generate_signature(
        config.MESSAGE_SECRET_KEY, dumps(message).encode('utf-8')
    )
    rsp = client.post(
        f'/api/events/{message["type"]}',
        json=message,
        headers={'X-Signature': signature},
    )
    assert rsp.ok == expected
