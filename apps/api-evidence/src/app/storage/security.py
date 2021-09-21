import typing

from cryptography.fernet import Fernet, InvalidToken


class Encryption:
    def encrypt(self, file: typing.IO) -> bytes:
        raise NotImplementedError

    def decrypt(self, encryted_file: typing.IO) -> typing.Optional[bytes]:
        raise NotImplementedError


class FernetEncryption(Encryption):
    """
    File encryption using Fernet (AES128-CBC with HMAC-SHA256)
    """

    encryptor: Fernet

    def __init__(self, secret_key: bytes) -> None:
        self.encryptor = Fernet(secret_key)

    def encrypt(self, file: typing.IO) -> bytes:
        return self.encryptor.encrypt(file.read())

    def decrypt(self, encryted_file: typing.IO) -> typing.Optional[bytes]:
        try:
            return self.encryptor.decrypt(encryted_file.read())
        except InvalidToken:
            pass
        return None
