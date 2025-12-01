FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=2.1.4

RUN pip install "poetry==$POETRY_VERSION" && poetry config virtualenvs.create false

WORKDIR /src

COPY pyproject.toml poetry.lock* ./

RUN poetry install --no-interaction --no-ansi --no-root

COPY app.py ./app.py
COPY src ./src

CMD ["python", "app.py"]
