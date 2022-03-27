from http.client import HTTPException
from typing import Any, Callable, Generator
from fastapi import HTTPException, status

from eth_utils.address import is_address, to_normalized_address
from pydantic.errors import PydanticValueError


class EthAddressError(PydanticValueError):
    msg_template = 'value is not a valid Ethereum address'


class EthAddress(str):
    @classmethod
    def __get_validators__(cls) -> Generator[Callable[..., Any], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> 'EthAddress':
        try:
            v = to_normalized_address(v)
            if is_address(v):
                return cls(v)
        except:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
