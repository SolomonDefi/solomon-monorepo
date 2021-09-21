import typing

import boto3
from botocore.client import BaseClient
from botocore.exceptions import ClientError
from botocore.response import StreamingBody

from . import StorageBackend, StorageBackendError


class GetObjectError(StorageBackendError):
    pass


class S3(StorageBackend):
    name: str = 'S3'
    s3_client: BaseClient
    bucket_name: str

    def __init__(
        self,
        region: str,
        key: str,
        secret: str,
        bucket_name: str,
        endpoint: typing.Optional[str] = None,
    ) -> None:
        config = {
            'region_name': region,
            'aws_access_key_id': key,
            'aws_secret_access_key': secret,
        }
        self.bucket_name = bucket_name
        if endpoint is not None:
            config['endpoint_url'] = f'https://{endpoint}'
        self.s3_client = boto3.client('s3', **config)

    def save_file(self, name: str, file: typing.IO) -> str:
        try:
            self.s3_client.upload_fileobj(
                file, self.bucket_name, name, ExtraArgs={'ACL': 'private'}
            )
        except:
            pass

    def get_file(self, key: str) -> typing.IO:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            body: StreamingBody = response['Body']

            return body._raw_stream
        except ClientError as e:
            raise GetObjectError from e
