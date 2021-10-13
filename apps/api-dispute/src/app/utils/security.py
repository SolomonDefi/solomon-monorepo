import base64
import hashlib
import hmac


def generate_signature(secret_key: bytes, message: bytes) -> str:
    h = hmac.new(secret_key, msg=message, digestmod=hashlib.sha256)
    return base64.b64encode(h.digest()).decode('utf-8')
