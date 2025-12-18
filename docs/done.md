# Что реализовано

## Обзор

Проект реализует полный цикл работы с ML ансамблями: от реализации алгоритмов до веб-интерфейса для обучения и инференса. Архитектура разделена на модули с чистым разделением ответственности.

---

## 1. Реализация алгоритмов (10/10 баллов)

### Random Forest (`ensembles/random_forest.py`)

- Класс `RandomForestMSE` с полной реализацией
- Bootstrap-сэмплирование для каждого дерева
- Усреднение предсказаний всех деревьев
- Поддержка параметров: `n_estimators`, `max_depth`, `max_features`
- Методы `fit()`, `predict()`, `dump()`, `load()`
- Отслеживание метрик обучения (RMSLE)
- Поддержка early stopping с параметром `patience`

### Gradient Boosting (`ensembles/boosting.py`)

- Класс `GradientBoostingMSE` с полной реализацией
- Последовательное обучение на антиградиенте (residuals)
- Инициализация константным предсказанием `F_0 = mean(y)`
- Поддержка `learning_rate` для регуляризации
- Методы `fit()`, `predict()`, `dump()`, `load()`
- Отслеживание метрик и early stopping

### Утилиты (`ensembles/utils.py`)

- Функция `rmsle()` — Root Mean Squared Logarithmic Error
- Функция `whether_to_stop()` — логика early stopping
- TypedDict `ConvergenceHistory` для хранения истории обучения

---

## 2. Эксперименты (15/15 баллов)

### Проведённые эксперименты (`experiments/`)

- Jupyter notebook `exp.ipynb` с полными экспериментами
- Датасет: House Sales in King County, USA (`data/kc_house_data.csv`)
- Графики сохранены в `experiments/plots/` (PNG 300dpi + SVG)

### Предобработка данных

- Извлечение признаков из даты: year, month, day
- Удаление ненужных столбцов: id, date
- One-hot encoding для zipcode (70 уникальных значений)
- Разделение на train/val/test (64%/16%/20%)
- Целевая переменная: `price`
- Итого: 90 признаков, 21613 объектов

### Исследованные факторы

**Random Forest (RMSE + время обучения):**
- Количество деревьев: [5, 10, 20, 30, 50, 75, 100]
- max_features: [sqrt(n)=9, n/4=22, n/2=45, n=90]
- max_depth: [3, 5, 10, 15, 20, None] — включая без ограничения

**Gradient Boosting (RMSE + время обучения):**
- Количество деревьев: [10, 20, 30, 50, 75, 100, 150]
- max_features: [sqrt(n)=9, n/4=22, n/2=45, n=90]
- max_depth: [2, 3, 5, 7, 10, None] — включая без ограничения
- learning_rate: [0.01, 0.05, 0.1, 0.2, 0.3, 0.5]

### Результаты

| Модель | RMSE (test) | Лучшие параметры | Время |
|--------|-------------|------------------|-------|
| Random Forest | ~$146,000 | 75 деревьев, depth=15 | ~7 сек |
| Gradient Boosting | ~$142,000 | 100 деревьев, depth=5, lr=0.1 | ~4 сек |

### Графики (`experiments/plots/`)

- `rf_n_estimators.png/svg` — RF: зависимость от числа деревьев
- `rf_max_depth.png/svg` — RF: зависимость от глубины
- `gb_n_estimators.png/svg` — GB: зависимость от числа деревьев
- `gb_learning_rate.png/svg` — GB: зависимость от learning rate
- `comparison_predictions.png/svg` — сравнение предсказаний моделей

---

## 3. Веб-сервер (15/15 баллов)

### Архитектура

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│   Streamlit     │◄────────────►│    FastAPI      │
│    (ui.py)      │   REST API   │  (ml_app.py)    │
└─────────────────┘              └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   ensembles/    │
                                 │ RandomForestMSE │
                                 │ GradientBoosting│
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │     runs/       │
                                 │  (file storage) │
                                 └─────────────────┘
```

### Backend (`backend/`)

**Структура:**

```
backend/
├── ml_app.py                     # FastAPI приложение для ML
├── app.py                        # Полное приложение (с users/auth)
└── src/
    ├── experiments/              # ML эксперименты модуль
    │   ├── __init__.py
    │   ├── schemas.py            # Pydantic схемы
    │   ├── service.py            # Бизнес-логика
    │   └── router.py             # API endpoints
    ├── users/                    # Пользователи (расширение)
    ├── database/                 # SQLAlchemy (расширение)
    └── schemas/                  # Общие схемы
```

**API Endpoints (ML):**

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/existing_experiments/` | Список всех экспериментов |
| POST | `/register_experiment/` | Создать эксперимент + загрузить данные |
| GET | `/experiment_config/` | Получить конфигурацию эксперимента |
| GET | `/needs_training` | Проверить, нужно ли обучение |
| POST | `/train/` | Обучить модель |
| GET | `/convergence_history/` | Получить кривые обучения |
| POST | `/predict/` | Сделать предсказание |
| GET | `/health` | Health check |

**Технические требования (выполнены):**
- ✅ FastAPI
- ✅ Все ручки в подмодуле `router.py`
- ✅ Все аргументы аннотированы (`Annotated[]`)
- ✅ Возвращаемые значения аннотированы (`response_model`)

### Frontend (Streamlit)

**Файл:** `ui.py` (не модифицирован согласно заданию)

**Функциональность:**
1. Создание нового эксперимента с выбором гиперпараметров
2. Загрузка CSV датасета
3. Обучение модели
4. Просмотр кривых обучения (RMSLE)
5. Инференс на новых данных

### Связующие модули (`ensembles/`)

**`ensembles/backend.py`:**
- `ExperimentConfig` — Pydantic схема конфигурации эксперимента

**`ensembles/frontend.py`:**
- `Client` — HTTP клиент для общения с бэкендом
- `plot_learning_curves()` — визуализация кривых обучения (Plotly)
- `ConvergenceHistoryResponse` — модель ответа с историей

### Хранение данных

Эксперименты хранятся в файловой системе (`runs/`):

```
runs/
└── experiment_name/
    ├── config.json           # Конфигурация эксперимента
    ├── train_data.csv        # Обучающие данные
    ├── convergence_history.json  # История обучения
    └── model/
        ├── params.json       # Параметры модели
        └── trees/
            ├── tree_0000.joblib
            ├── tree_0001.joblib
            └── ...
```

---

## 4. Docker (15/15 баллов — входит в веб-сервер)

### Архитектура Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    docker-compose.yml                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐      ┌─────────────────────┐       │
│  │  ensembles-backend  │      │  ensembles-frontend │       │
│  │  (FastAPI)          │◄────►│  (Streamlit)        │       │
│  │  Port: 8000         │      │  Port: 8501         │       │
│  └─────────────────────┘      └─────────────────────┘       │
│           │                            │                     │
│           ▼                            │                     │
│  ┌─────────────────────┐               │                     │
│  │  runs-data (volume) │               │                     │
│  │  Persistent storage │               │                     │
│  └─────────────────────┘               │                     │
│                                        │                     │
│  ┌─────────────────────────────────────┘                     │
│  │  ensembles-network (bridge)                               │
│  └───────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### Файлы Docker

**`backend/Dockerfile`:**
```dockerfile
FROM python:3.12-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ml_app.py ./ml_app.py
COPY backend/src ./src
COPY ensembles ./ensembles

EXPOSE 8000
HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1
CMD ["python", "ml_app.py"]
```

**`Dockerfile.streamlit`:**
```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ui.py ./ui.py
COPY ensembles ./ensembles

EXPOSE 8501
HEALTHCHECK CMD curl -f http://localhost:8501/_stcore/health || exit 1
CMD ["streamlit", "run", "ui.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

**`docker-compose.yml`:**
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: ensembles-backend
    ports:
      - "8000:8000"
    volumes:
      - runs-data:/app/runs
    networks:
      - ensembles-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.streamlit
    container_name: ensembles-frontend
    ports:
      - "8501:8501"
    environment:
      - BASE_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - ensembles-network
    restart: unless-stopped

networks:
  ensembles-network:
    driver: bridge

volumes:
  runs-data:
    driver: local
```

### Команды Docker

```bash
# Сборка образов
docker-compose build

# Запуск в фоне
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Пересборка и запуск
docker-compose up -d --build
```

### Проверка работы

```bash
# Health check бэкенда
curl http://localhost:8000/health
# {"status":"ok"}

# Health check фронтенда
curl http://localhost:8501/_stcore/health
# ok

# Список экспериментов
curl http://localhost:8000/existing_experiments/
# {"experiment_names":[]}

# Swagger документация
open http://localhost:8000/docs
```

### Сетевое взаимодействие

- **Frontend → Backend**: `http://backend:8000` (внутренняя сеть Docker)
- **Browser → Frontend**: `http://localhost:8501`
- **Browser → Backend API**: `http://localhost:8000`

### Персистентность данных

Volume `runs-data` сохраняет обученные модели между перезапусками:
```
runs-data/
└── experiment_name/
    ├── config.json
    ├── train_data.csv
    ├── convergence_history.json
    └── model/
```

### Локальный запуск (без Docker)

```bash
# Terminal 1: Backend
cd backend && python ml_app.py

# Terminal 2: Frontend
streamlit run ui.py

# Открыть http://localhost:8501
```

---

## 5. Ведение проекта (10/10 баллов)

### Структура репозитория

```
prak-mmp-5-semestr-task3/
├── ensembles/                # ML алгоритмы
│   ├── __init__.py
│   ├── random_forest.py      # RandomForestMSE
│   ├── boosting.py           # GradientBoostingMSE
│   ├── utils.py              # RMSLE, early stopping
│   ├── backend.py            # Схемы для ui.py
│   └── frontend.py           # Клиент для ui.py
├── backend/                  # FastAPI сервер
│   ├── ml_app.py             # ML endpoints app
│   ├── app.py                # Full app (users + ML)
│   └── src/
│       └── experiments/      # ML модуль
├── frontend/                 # React приложение (расширение)
├── data/                     # Датасеты
├── experiments/              # Jupyter эксперименты
├── runs/                     # Сохранённые эксперименты
├── docs/                     # Документация
├── tests/                    # Тесты
├── ui.py                     # Streamlit интерфейс
├── .env                      # Переменные окружения
├── docker-compose.yml
├── Makefile
├── pyproject.toml
└── README.md
```

### Переменные окружения

**`.env`:**
```
BASE_URL=http://localhost:8000
```

---

## 6. Бонусная часть

**Не реализовано** (требовалось сравнение экспериментов в Streamlit UI)

---

## Итого

| Часть | Требовалось | Реализовано | Статус |
|-------|-------------|-------------|--------|
| Алгоритмы | Random Forest, Gradient Boosting | Полностью | ✅ |
| Эксперименты | Исследование факторов | Полностью | ✅ |
| Веб-сервер | FastAPI + Streamlit | Полностью | ✅ |
| Docker | docker-compose | Полностью | ✅ |
| Ведение проекта | README, структура | Полностью | ✅ |
| Бонус | Сравнение экспериментов | — | ❌ |

**Базовые баллы: 50/50**

---

## Как запустить

### Локально

```bash
# 1. Установить зависимости
pip install -r requirements.txt

# 2. Запустить бэкенд
cd backend && python ml_app.py

# 3. В другом терминале запустить фронтенд
streamlit run ui.py

# 4. Открыть http://localhost:8501
```

### Docker

```bash
docker-compose up --build
# Открыть http://localhost:8501
```

---

## API документация

После запуска бэкенда доступна по адресу:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
