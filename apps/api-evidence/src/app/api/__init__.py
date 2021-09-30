from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.api import evidence, users, auth

api_router = APIRouter()
api_router.include_router(evidence.router, prefix='/evidence', tags=['evidence'])
api_router.include_router(users.router, prefix='/users', tags=['users'])
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])


@api_router.get('/health/app')
def healthcheck() -> JSONResponse:
    return JSONResponse({'status': 'ok'})
