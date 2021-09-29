from typing import Optional

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api import api_router
from app.config import config

description = """
Solomon Evidence API uploads evidence files to various storages for disputes.
"""

docs_urls: dict[str, Optional[str]] = {
    'openapi_url': f'{config.API_PREFIX}/openapi.json',
}
if not config.DEBUG:
    docs_urls = {
        'openapi_url': None,
        'docs_url': None,
        'redoc_url': None,
    }


app = FastAPI(
    debug=config.DEBUG,
    title=config.PROJECT_NAME,
    version='1.0',
    description=description,
    contact={
        'name': 'Solomon',
        'url': 'https://solomondefi.com/',
        'email': 'solomondefi@gmail.com',
    },
    **docs_urls,
)

# Set all CORS enabled origins
if config.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in config.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

app.include_router(api_router, prefix=config.API_PREFIX)
