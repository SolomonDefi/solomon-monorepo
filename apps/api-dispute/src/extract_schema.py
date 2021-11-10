import argparse
import inspect
import json
import typing

from pydantic.schema import schema

from app.schemas import event


def is_event(obj: typing.Any) -> bool:
    if not inspect.isclass(obj):
        return False
    if obj is event.EventIn:
        return False
    return issubclass(obj, event.EventIn)


def extract_schema(file: str) -> None:
    models = [model for _, model in inspect.getmembers(event, is_event)]
    top_level_schema = schema(models, title='Event Schema')
    with open(file, 'w') as f:
        json.dump(top_level_schema, f, indent=2)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-f", required=True, help="Destination file to export json schema"
    )
    args = parser.parse_args()
    extract_schema(args.f)
