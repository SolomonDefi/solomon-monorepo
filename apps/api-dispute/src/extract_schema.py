import argparse
import inspect
import json
import typing
import os

from pydantic.schema import schema

from app.schemas import event


def extract_schema(file: str) -> None:
    models = [
        event.DisputeCreatedEvent,
        event.DisputeCompletedEvent,
        event.EvidenceSubmittedEvent,
        event.PaymentCreatedEvent,
    ]
    top_level_schema = schema(models, title='Event Schema')
    os.makedirs(os.path.dirname(file), exist_ok=True)
    with open(file, 'w') as f:
        json.dump(top_level_schema, f, indent=2)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-f", required=True, help="Destination file to export json schema"
    )
    args = parser.parse_args()
    extract_schema(args.f)
