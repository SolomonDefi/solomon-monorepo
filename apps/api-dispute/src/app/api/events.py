import typing

from fastapi import APIRouter, Depends, HTTPException, status

from app.utils.deps import SignatureHeader


router = APIRouter()


@router.post('/ping', status_code=status.HTTP_200_OK)
def ping(
    message: typing.Optional[typing.Any] = Depends(SignatureHeader()),
) -> typing.Any:
    if message is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return ''
