import zipfile
from pathlib import PurePath
from typing import Any, Callable, Generator

from eth_utils.address import is_address
from fastapi import UploadFile
from pydantic.errors import PydanticValueError

from app.config import config


class EthAddressError(PydanticValueError):
    msg_template = 'value is not a valid Ethereum address'


class EthAddress(str):
    @classmethod
    def __get_validators__(cls) -> Generator[Callable[..., Any], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> 'EthAddress':
        if is_address(v):
            return cls(v)
        raise EthAddressError()


class FileTooLargeError(PydanticValueError):
    msg_template = 'File is too large'


class ForbiddenFileTypeError(PydanticValueError):
    msg_template = 'File type is forbidden'


class InvalidZipFileError(PydanticValueError):
    msg_template = 'Zip file is invalid'


class EvidenceFile(UploadFile):
    @staticmethod
    def _file_extension(filename: str) -> str:
        return PurePath(filename).suffix.strip('.').lower()

    @classmethod
    def _is_valid_zip_file(cls, file: UploadFile) -> bool:
        # validate zip file
        if not zipfile.is_zipfile(file.file):
            return False

        # allow only single folder level
        for dir in zipfile.Path(file.file).iterdir():
            if dir.is_dir():
                return False

        # check files inside zip file
        for info in zipfile.ZipFile(file.file).infolist():
            extension = cls._file_extension(info.filename)
            if extension not in config.ALLOWED_FILE_TYPES:
                return False

        return True

    @classmethod
    def __get_validators__(cls) -> Generator[Callable[..., Any], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> 'EvidenceFile':
        file: UploadFile = UploadFile.validate(v)

        size_in_mb = .0
        for chunk in file.file:
            size_in_mb += (len(chunk) / 1024 / 1024)
            if size_in_mb > config.MAX_FILE_SIZE:
                raise FileTooLargeError

        extension = cls._file_extension(file.filename)
        if extension not in config.ALLOWED_FILE_TYPES:
            raise ForbiddenFileTypeError

        if extension == 'zip' and not cls._is_valid_zip_file(file):
            raise InvalidZipFileError

        return file
