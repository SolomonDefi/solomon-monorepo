import io
import typing

import boto3
from botocore.exceptions import ClientError

from . import StorageBackend, StorageBackendError


if typing.TYPE_CHECKING:
    from mypy_boto3_s3.client import S3Client


class GetObjectError(StorageBackendError):
    pass


class PutObjectError(StorageBackendError):
    pass


class S3(StorageBackend):
    name: str = 'S3'
    s3_client: "S3Client"
    bucket_name: str

    def __init__(
        self,
        region: str,
        key: str,
        secret: str,
        bucket_name: str,
        endpoint: typing.Optional[str] = None,
    ) -> None:
        self.bucket_name = bucket_name
        endpoint_url = None
        if endpoint:
            endpoint_url = f'https://{endpoint}'
        self.s3_client = boto3.client(
            's3',
            region_name=region,
            aws_access_key_id=key,
            aws_secret_access_key=secret,
            endpoint_url=endpoint_url,
        )

    def save_file(self, name: str, file: typing.IO) -> str:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name, Key=name, Body=file, ACL='private'
            )
            return name
        except ClientError as e:
            raise PutObjectError from e

    def get_file(self, key: str) -> typing.IO:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            return io.BytesIO(response['Body'].read())
        except ClientError as e:
            raise GetObjectError from e
