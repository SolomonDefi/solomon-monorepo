import random
import string

from fastapi.testclient import TestClient

from app.config import config


def random_lower_string() -> str:
    return ''.join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f'{random_lower_string()}@{random_lower_string()}.com'


def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    login_data = {
        'username': config.INITIAL_ADMIN_EMAIL,
        'password': config.INITIAL_ADMIN_PASSWORD,
    }
    r = client.post(f'{config.API_PREFIX}/auth/email', data=login_data)
    tokens = r.json()
    a_token = tokens['access_token']
    headers = {'Authorization': f'Bearer {a_token}'}
    return headers
