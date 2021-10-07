from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from .utils.user import create_random_user, create_random_wallet, eth_sign_data


def test_api_without_auth(client: TestClient) -> None:
    rsp = client.get('/api/users/me')
    assert rsp.status_code == 401


def test_email_login(client: TestClient, db: Session) -> None:
    user, password = create_random_user(db)
    rsp = client.post('/api/auth/email', {'username': user.email, 'password': password})
    assert rsp.ok

    # check the validity of the access token
    access_token = rsp.json()['access_token']
    rsp = client.get(
        '/api/users/me', headers={'Authorization': f'Bearer {access_token}'}
    )
    assert rsp.ok


def test_login_with_nonexist_email(client: TestClient) -> None:
    rsp = client.post(
        '/api/auth/email', {'username': 'nonexist@test.com', 'password': 'password'}
    )
    assert rsp.status_code == 401


def test_address_login(client: TestClient) -> None:
    address, private_key = create_random_wallet()
    rsp = client.post('/api/auth/address-challenge', json={'address': address})
    assert rsp.ok
    challenge = rsp.json()['challenge']
    signature = eth_sign_data(challenge, private_key)
    challenge_contents = challenge['message']['contents']
    rsp = client.post(
        '/api/auth/address',
        headers={
            'Authorization': f'Challenge {address} {challenge_contents} {signature}'
        },
    )
    assert rsp.ok

    # check the validity of the access token
    access_token = rsp.json()['access_token']
    rsp = client.get(
        '/api/users/me', headers={'Authorization': f'Bearer {access_token}'}
    )
    assert rsp.ok
