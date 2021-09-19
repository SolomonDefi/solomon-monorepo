from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.api import upload_item, user, auth

api_router = APIRouter()
api_router.include_router(upload_item.router, prefix='/items', tags=['upload_item'])
api_router.include_router(user.router, prefix='/users', tags=['user'])
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])


@api_router.get('/health/app')
def healthcheck() -> None:
    return JSONResponse({'status': 'ok'})
