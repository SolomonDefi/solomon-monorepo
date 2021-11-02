from json import dumps
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

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


valid_eth_address = '0xd3cda913deb6f67967b99d67acdfa1712c293601'
event_data_ids = [
    "valid_dispute_created",
    "fail_dispute_created",
    "valid_dispute_completed",
    "valid_evidence_submitted",
    "valid_payment_created",
]
event_data: list[tuple[dict, bool]] = [
    (
        {
            "id": uuid4().hex,
            "type": "dispute.preorder.created",
            "party1": valid_eth_address,
            "party2": valid_eth_address,
            "contract": valid_eth_address,
            "judgeContract": valid_eth_address,
        },
        True,
    ),
    (
        {
            "id": uuid4().hex,
            "type": "dispute.preorder.created",
            "party1": valid_eth_address,
            "party2": 'incorrect_address',
            "contract": valid_eth_address,
            "judgeContract": valid_eth_address,
        },
        False,
    ),
    (
        {
            "id": uuid4().hex,
            "type": "dispute.preorder.completed",
            "party1": valid_eth_address,
            "party2": valid_eth_address,
            "contract": valid_eth_address,
            "judgeContract": valid_eth_address,
            "awardedTo": valid_eth_address,
        },
        True,
    ),
    (
        {
            "id": uuid4().hex,
            "type": "evidence.preorder.submitted",
            "party1": valid_eth_address,
            "party2": valid_eth_address,
            "contract": valid_eth_address,
            "judgeContract": valid_eth_address,
            "evidenceUrl": valid_eth_address,
            "submitter": valid_eth_address,
        },
        True,
    ),
    (
        {
            "id": uuid4().hex,
            "type": "payment.preorder.created",
            "party1": valid_eth_address,
            "party2": valid_eth_address,
            "contract": valid_eth_address,
            "judgeContract": valid_eth_address,
            "token": valid_eth_address,
            "discount": 40,
            "ethPaid": "1000000"
        },
        True,
    ),
]


@pytest.mark.parametrize("message,expected", event_data, ids=event_data_ids)
def test_events(db: Session, client: TestClient, message: dict, expected: bool) -> None:
    signature = generate_signature(
        config.MESSAGE_SECRET_KEY, dumps(message).encode('utf-8')
    )
    rsp = client.post(
        '/api/events',
        json=message,
        headers={config.SIGNATURE_HEADER_NAME: signature},
    )
    assert rsp.ok == expected
