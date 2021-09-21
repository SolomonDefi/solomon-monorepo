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

    def __init__(
        self, backend: StorageBackend, encryption: Encryption = None
    ) -> None:
        self.backend = backend
        self.encryption = encryption

    def _file_extension(self, filename: str) -> str:
        return PurePath(filename).suffix

    def _stored_filename(self, file: typing.IO) -> str:
        ext = self._file_extension(file.name)
        if self.encryption is not None:
            ext = '.enc'
        return f'{uuid4().hex}{ext}'

    def save(self, file: typing.IO) -> str:
        if self.encryption is not None:
            encrypted = io.BytesIO()
            encrypted.write(self.encryption.encrypt(file))
            return self.backend.save_file(self._stored_filename(file), encrypted)
        return self.backend.save_file(self._stored_filename(file), file)

    def get(self, file_key: str) -> typing.IO:
        try:
            stored_file = self.backend.get_file(file_key)
            if self.encryption is not None:
                decrypted = self.encryption.decrypt(stored_file)
                if decrypted is None:
                    raise InvalidEncryptedFile
                file = io.BytesIO()
                file.write(decrypted)
                return file
        except (InvalidEncryptedFile, StorageBackendError):
            raise StorageError
        return stored_file
