from typing import Any, Callable, Generator

from eth_utils.address import is_address
from pydantic.errors import PydanticValueError


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
