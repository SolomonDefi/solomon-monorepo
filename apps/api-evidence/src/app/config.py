import secrets
from typing import Any, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, EmailStr, PostgresDsn, validator


class Config(BaseSettings):
    API_PREFIX: str = '/api'
    SECRET_KEY: str = secrets.token_urlsafe(32)
    CHAIN_ID: int
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    # 1 hour
    CHALLENGE_TTL: int = 60 * 60
    SERVER_NAME: str
    # CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: "['http://localhost', 'http://localhost:4200', 'http://localhost:3000', \
    # 'http://localhost:8080', 'http://local.dockertoolbox.tiangolo.com']"
    CORS_ORIGINS: list[AnyHttpUrl] = []

    @validator('CORS_ORIGINS', pre=True)
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> Union[list[str], str]:
        if isinstance(v, str) and not v.startswith('['):
            return [i.strip() for i in v.split(',')]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator('SQLALCHEMY_DATABASE_URI', pre=True, always=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme='postgresql',
            user=values.get('POSTGRES_USER'),
            password=values.get('POSTGRES_PASSWORD'),
            host=values.get('POSTGRES_SERVER'),
            path=f'/{values.get("POSTGRES_DB") or ""}',
            port=values.get('POSTGRES_PORT'),
        )

    INITIAL_ADMIN_EMAIL: EmailStr
    INITIAL_ADMIN_PASSWORD: str

    APP_DOMAIN: str = 'localhost'
    APP_PORT = 5010
    S3_BUCKET: str = 'evidence-uploads'
    S3_ENDPOINT: Optional[str] = None
    S3_KEY: Optional[str] = None
    S3_SECRET: Optional[str] = None
    S3_REGION: Optional[str] = None
    SHORTENER_URL: AnyHttpUrl = 'http://localhost:5050/'
    SHORTENER_ACCESS_TOKEN: str = 'dev'

    MAX_FILE_TTL: int = 90  # in days
    MAX_FILE_SIZE: int = 4  # in mb
    ALLOWED_FILE_TYPES: list[str] = ['png', 'jpg', 'jepg', 'zip', 'txt', 'pdf']

    TEST_DB: Optional[str] = 'solomon_test'

    class Config:
        case_sensitive = True
        env_file = '.env'
        env_file_encoding = 'utf-8'


config = Config()
