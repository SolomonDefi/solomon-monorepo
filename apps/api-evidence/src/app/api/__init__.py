from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.api import auth, evidence, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['Authentication'])
api_router.include_router(users.router, prefix='/users', tags=['Users'])
api_router.include_router(evidence.router, prefix='/evidence', tags=['Evidence'])


@api_router.get('/health/app', tags=['Healthcheck'])
def healthcheck() -> JSONResponse:
    return JSONResponse({'status': 'ok'})
