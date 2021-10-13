import typing

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.api import events


api_router = APIRouter()
api_router.include_router(events.router, prefix='/events', tags=['Events'])


@api_router.get('/health/app', tags=['Healthcheck'])
def healthcheck() -> typing.Any:
    return JSONResponse({'status': 'ok'})
