# Docker Setup для Ensembles Server

Этот проект использует Docker Compose для запуска backend и frontend сервисов.

## Требования

- Docker >= 20.10
- Docker Compose >= 2.0
- Make (опционально, для использования Makefile)

## Быстрый старт

### С использованием Makefile (рекомендуется)

```bash
# Собрать и запустить все сервисы
make up

# Или в dev режиме с логами
make dev
```

### Без Makefile

```bash
# Собрать образы
docker-compose build

# Запустить сервисы в фоне
docker-compose up -d

# Или запустить с логами в консоли
docker-compose up
```

## Доступ к сервисам

После запуска:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

## Основные команды

### Управление сервисами

```bash
# Запустить все сервисы
make up
# или
docker-compose up -d

# Остановить все сервисы
make down
# или
docker-compose down

# Перезапустить сервисы
make restart

# Пересобрать и запустить
make rebuild
# или
docker-compose up --build -d
```

### Логи

```bash
# Все логи
make logs
# или
docker-compose logs -f

# Логи backend
make backend-logs
# или
docker-compose logs -f backend

# Логи frontend
make frontend-logs
# или
docker-compose logs -f frontend
```

### Статус

```bash
# Проверить статус контейнеров
make ps
# или
docker-compose ps

# Проверить health
make health
```

### Вход в контейнеры

```bash
# Backend shell
make shell-backend
# или
docker-compose exec backend /bin/sh

# Frontend shell
make shell-frontend
# или
docker-compose exec frontend /bin/sh
```

### Очистка

```bash
# Остановить и удалить контейнеры
make clean
# или
docker-compose down -v

# Полная очистка (включая образы)
make prune
# или
docker-compose down -v --rmi all
```

## Архитектура

### Backend (FastAPI)

- **Порт**: 8000
- **Dockerfile**: `backend/Dockerfile`
- **Основан на**: Python 3.12-slim
- **Используемые технологии**:
  - FastAPI для REST API
  - Gunicorn + Uvicorn для production сервера
  - SQLAlchemy для работы с БД
  - Собственные реализации Random Forest и Gradient Boosting

### Frontend (React)

- **Порт**: 3000 (проксирует на 80 внутри контейнера)
- **Dockerfile**: `frontend/Dockerfile`
- **Основан на**: Node 20 для сборки, Nginx для раздачи статики
- **Используемые технологии**:
  - React 18
  - TypeScript
  - Webpack 5
  - Bootstrap 5
  - Nginx для production

## Тома (Volumes)

### Backend volumes

```yaml
volumes:
  - ./ensembles:/src/ensembles:ro  # Модели ML (read-only)
  - ./data:/src/data:ro             # Датасеты (read-only)
  - ./runs:/src/runs                # Обученные модели (persistent)
```

## Сеть

Все сервисы работают в общей Docker сети `ensembles-network`:

```
┌─────────────────┐
│   Frontend      │
│  (port 3000)    │
└────────┬────────┘
         │
         │ HTTP requests
         ▼
┌─────────────────┐
│   Backend       │
│  (port 8000)    │
└─────────────────┘
```

## Переменные окружения

### Backend

Можно настроить через файл `.env`:

```bash
# Создайте файл .env в корне проекта
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

### Frontend

```bash
REACT_APP_API_URL=http://localhost:8000
```

## Health Checks

Оба сервиса имеют health checks:

- **Backend**: Проверяет доступность `/docs` endpoint
- **Frontend**: Проверяет доступность главной страницы

Интервал проверки: каждые 30 секунд

## Troubleshooting

### Порты заняты

Если порты 3000 или 8000 заняты, измените их в `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Изменить левую часть

  frontend:
    ports:
      - "3001:80"    # Изменить левую часть
```

### Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Пересоберите образы
docker-compose build --no-cache

# Очистите старые контейнеры
docker system prune -a
```

### Frontend не видит Backend

Убедитесь, что:
1. Backend запущен и доступен на порту 8000
2. В коде frontend используется правильный URL API
3. CORS настроен в backend для разрешения запросов с frontend

### Медленная сборка

Используйте `.dockerignore` файлы для исключения ненужных файлов:
- Корневой `.dockerignore` исключает node_modules, .venv и т.д.
- `frontend/.dockerignore` исключает dev зависимости

## Production Deployment

Для production рекомендуется:

1. **Использовать environment файлы**:
```bash
docker-compose --env-file .env.production up -d
```

2. **Настроить reverse proxy** (например, Nginx) перед сервисами

3. **Использовать Docker secrets** для чувствительных данных

4. **Настроить мониторинг** (Prometheus, Grafana)

5. **Настроить логирование** (ELK stack, Loki)

## Development

Для разработки с hot reload:

```bash
# Backend с auto-reload
docker-compose up backend

# Frontend с hot reload - запускайте локально
cd frontend
npm start
```

## Полезные команды Make

```bash
make help          # Показать все доступные команды
make build         # Собрать образы
make up            # Запустить сервисы
make down          # Остановить сервисы
make restart       # Перезапустить
make logs          # Показать логи
make ps            # Статус контейнеров
make clean         # Очистка
make prune         # Полная очистка
make rebuild       # Пересборка
make dev           # Dev режим с логами
make health        # Проверка здоровья
```

## Дополнительная информация

- [README.md](README.md) - Общая документация проекта
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Описание реализации ML алгоритмов
- [REPORT.md](REPORT.md) - Отчёт по экспериментам
