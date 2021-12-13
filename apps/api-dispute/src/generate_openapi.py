import argparse
import json
from pathlib import Path

from fastapi.openapi.utils import get_openapi

from main import app


def write_openapi(path: Path) -> None:
    if not path.match('*.json'):
        raise ValueError('Output file must be .json')
    with open(path, 'w') as f:
        openapi = get_openapi(
            title=app.title,
            version=app.version,
            openapi_version=app.openapi_version,
            description=app.description,
            routes=app.routes,
            tags=app.openapi_tags,
            servers=app.servers,
            terms_of_service=app.terms_of_service,
            contact=app.contact,
            license_info=app.license_info,
        )
        json.dump(openapi, f, separators=(',', ':'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-o', dest='output', required=True, help='output file')
    args = parser.parse_args()
    write_openapi(Path(args.output))
