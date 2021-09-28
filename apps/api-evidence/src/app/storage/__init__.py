import io
import typing
from pathlib import PurePath
from uuid import uuid4

from .backend import StorageBackend, StorageBackendError
from .security import Encryption


class StorageError(Exception):
    pass


class InvalidEncryptedFile(Exception):
    pass


class Storage:
    backend: StorageBackend
    encryption: typing.Optional[Encryption]

    def __init__(self, backend: StorageBackend, encryption: Encryption = None) -> None:
        self.backend = backend
        self.encryption = encryption

    def _file_extension(self, filename: str) -> str:
        return PurePath(filename).suffix.lower()

    def _stored_filename(self, filename: str) -> str:
        ext = self._file_extension(filename)
        if self.encryption is not None:
            ext = '.enc'
        return f'{uuid4().hex}{ext}'

    def save(self, name: str, file: typing.IO) -> str:
        try:
            if self.encryption is not None:
                encrypted = io.BytesIO(self.encryption.encrypt(file))
                return self.backend.save_file(self._stored_filename(name), encrypted)
            return self.backend.save_file(self._stored_filename(name), file)
        except StorageBackendError:
            raise StorageError

    def get(self, file_key: str) -> typing.IO:
        try:
            stored_file = self.backend.get_file(file_key)
            if self.encryption is not None:
                decrypted = self.encryption.decrypt(stored_file)
                if decrypted is None:
                    raise InvalidEncryptedFile
                return io.BytesIO(decrypted)
        except (InvalidEncryptedFile, StorageBackendError):
            raise StorageError
        return stored_file
