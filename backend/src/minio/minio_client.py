import io
import inspect
import mimetypes
import uuid
from urllib.parse import urlparse
from typing import Optional
from datetime import timedelta, datetime
from fastapi import HTTPException, status
from miniopy_async import Minio
from miniopy_async.error import S3Error

from src.schemas.config import settings
from src.minio.minio_utils import (
    _normalize_key,
    _parse_file_id
)


mimetypes.add_type("application/octet-stream", ".ifc", strict=False)


class MinIOClient:
    def __init__(
        self,
        endpoint: str = settings.MINIO_INTERNAL_ENDPOINT,
        access_key: str = settings.MINIO_ACCESS_KEY,
        secret_key: str = settings.MINIO_SECRET_KEY,
        web_endpoint: str = settings.MINIO_PUBLIC_ENDPOINT,
        secure: bool = False
    ) -> None:
        self.web_endpoint = web_endpoint
        region = getattr(settings, "MINIO_REGION_NAME", "us-east-1") or "us-east-1"
        p = urlparse(endpoint)
        if p.scheme in ("http", "https"):
            ep_internal = p.netloc
            use_secure_internal = p.scheme == "https"
        else:
            ep_internal = endpoint
            use_secure_internal = secure
        self.client = Minio(
            endpoint=ep_internal,
            access_key=access_key,
            secret_key=secret_key,
            secure=use_secure_internal,
            region = region,
        )

        q = urlparse(web_endpoint)
        if q.scheme in ("http", "https"):
            ep_public = q.netloc
            use_secure_public = q.scheme == "https"
        else:
            ep_public = web_endpoint
            use_secure_public = secure
        self.client_public = Minio(
            endpoint=ep_public,
            access_key=access_key,
            secret_key=secret_key,
            secure=use_secure_public,
            region=region,
        )

    async def _ensure_bucket_exists(
            self,
            bucket: str
    ) -> None:
        try:
            await self.client.make_bucket(bucket)
        except S3Error as e:
            if e.code not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
                raise

    async def put(
        self,
        bucket: str,
        file_data: io.BytesIO | bytes,
        file_name: str,
        object_name: str | None = None,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None
    ) -> str:
        if not file_name:
            file_name = f"file_{uuid.uuid4()}"
        await self._ensure_bucket_exists(bucket)
        if isinstance(file_data, bytes):
            file_data = io.BytesIO(file_data)
        safe_name = file_name.replace("\\", "/").split("/")[-1]
        key = _normalize_key(object_name or safe_name)
        if hasattr(file_data, "seek"):
            file_data.seek(0, io.SEEK_END)
            file_size = file_data.tell()
            file_data.seek(0)
        else:
            buf = io.BytesIO(file_data.read())
            file_data = buf
            file_size = buf.getbuffer().nbytes
        ct = content_type or mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
        try:
            await self.client.put_object(
                bucket_name=bucket,
                object_name=key,
                data=file_data,
                length=file_size,
                content_type=ct,
                metadata=(metadata or {"original-name": safe_name})
            )
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"MinIO put_object failed: {e.code}"
            )
        return f"{bucket}:{key}"

    async def get(
            self,
            file_id: str
    ) -> io.BytesIO:
        bucket, object_name = _parse_file_id(file_id)
        try:
            resp = await self.client.get_object(
                bucket_name=bucket,
                object_name=object_name
            )
            try:
                data = await resp.read()
                return io.BytesIO(data)
            finally:
                close = getattr(resp, "close", None)
                if callable(close):
                    r = close()
                    if inspect.isawaitable(r):
                        await r
        except S3Error as e:
            if e.code == "NoSuchKey":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"File '{object_name}' not found in bucket '{bucket}'"
                )
            if e.code == "NoSuchBucket":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Bucket '{bucket}' not found"
                )
            raise


    async def object_exists(
            self,
            bucket: str,
            object_name: str
    ) -> bool:
        key = _normalize_key(object_name)
        try:
            await self.client.stat_object(
                bucket_name=bucket,
                object_name=key
            )
            return True
        except S3Error as e:
            if e.code in {"NoSuchKey", "NoSuchObject", "NoSuchBucket"}:
                return False
            raise


    async def remove(
            self,
            file_id: str,
            *,
            strict: bool = False
    ) -> None:
        bucket, object_name = _parse_file_id(file_id)
        try:
            await self.client.remove_object(
                bucket_name=bucket,
                object_name=object_name
            )
        except S3Error as e:
            if e.code in {"NoSuchKey", "NoSuchObject"}:
                if strict:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Object '{object_name}' not found in bucket '{bucket}'"
                    )
                return
            if e.code == "NoSuchBucket":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Bucket '{bucket}' not found"
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"MinIO remove_object failed: {e.code}"
            )

    async def put_presign_links(
        self,
        bucket: str,
        path: str,
        photo_names: list[str],
        expires: int = 86400
    ) -> list[str]:
        await self._ensure_bucket_exists(bucket)

        base = _normalize_key(path)
        links: list[str] = []

        for name in photo_names:
            object_name = _normalize_key(f"{base}/{name}")

            url = await self.client_public.presigned_put_object(
                bucket_name=bucket,
                object_name=object_name,
                expires=timedelta(seconds=expires)
            )
            links.append(url)
        return links

    async def get_presign_links(
        self,
        bucket: str,
        path: str,
        expires: int = 86400
    ) -> list[str]:
        links: list[str] = []
        async for obj in self.client.list_objects(
            bucket_name=bucket,
            prefix=_normalize_key(path),
            recursive=True
        ):
            url = await self.client_public.presigned_get_object(
                bucket_name=bucket,
                object_name=obj.object_name,
                expires=timedelta(seconds=expires)
            )
            links.append(url)
        return links

    async def delete_minio_photo(
            self,
            bucket: str,
            path: str
    ) -> None:
        async for obj in self.client.list_objects(
            bucket_name=bucket,
            prefix=_normalize_key(path),
            recursive=True
        ):
            await self.client.remove_object(
                bucket_name=bucket,
                object_name=obj.object_name
            )

    async def presign_get(
            self,
            *,
            bucket: str,
            object_name: str,
            expires: int = 7200
    ) -> str:
        url = await self.client_public.presigned_get_object(
            bucket_name=bucket,
            object_name=object_name,
            expires=timedelta(seconds=expires),
        )
        return url

    async def presign_get_by_id(
            self,
            file_id: str,
            expires: int = 7200
    ) -> str:
        bucket, object_name = _parse_file_id(file_id)
        return await self.presign_get(
            bucket=bucket,
            object_name=object_name,
            expires=expires
        )

    async def list_objects_with_signed_urls(
            self,
            bucket: str,
            expires: int = 7200
    ) -> list[tuple[str, str, Optional[datetime]]]:
        items = []
        async for obj in self.client.list_objects(
                bucket_name=bucket,
                recursive=True
        ):
            url = await self.presign_get(
                bucket=bucket,
                object_name=obj.object_name,
                expires=expires
            )
            items.append((
                obj.object_name,
                url,
                getattr(obj, "last_modified", None)
            ))
        items.sort(key=lambda x: (x[2] is not None, x[2]), reverse=True)
        return items

minio_client = MinIOClient()
