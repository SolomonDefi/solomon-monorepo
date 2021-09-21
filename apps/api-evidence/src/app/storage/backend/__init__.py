import typing


class StorageBackendError(Exception):
    pass


class StorageBackend:
    name: str

    def save_file(self, name: str, file: typing.IO) -> str:
        raise NotImplementedError

    def get_file(self, key: str) -> typing.IO:
        raise NotImplementedError
