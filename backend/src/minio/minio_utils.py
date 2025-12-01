import json
import tempfile
import time
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException, status



def _normalize_key(name: str) -> str:
    name = name.replace("\\", "/").lstrip("/")
    while "//" in name:
        name = name.replace("//", "/")
    parts = [p for p in name.split("/") if p not in ("", ".", "..")]
    return "/".join(parts)


def _parse_file_id(file_id: str) -> tuple[str, str]:
    parts = file_id.split(":", 1)
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file ID format. Expected 'bucket:object'"
        )
    return parts[0], parts[1]