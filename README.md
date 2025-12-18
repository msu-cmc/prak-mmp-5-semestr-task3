# ML Ensembles: Random Forest и Gradient Boosting

Практическая работа по курсу "Методы машинного обучения и распознавания образов" (ММРО), ВМК МГУ.

## Описание проекта

Реализация алгоритмов **Random Forest** и **Gradient Boosting** для задачи регрессии с веб-интерфейсом для обучения и инференса.

## Быстрый старт

### Docker (рекомендуется)

```bash
# Запуск
docker-compose up -d

# Проверка статуса
docker-compose ps

# Остановка
docker-compose down
```

После запуска:
- **Streamlit UI**: http://localhost:8501
- **Backend API**: http://localhost:8000/docs

### Локальный запуск

```bash
# 1. Установка зависимостей
pip install -r requirements.txt

# 2. Запуск бэкенда (терминал 1)
cd backend && python ml_app.py

# 3. Запуск фронтенда (терминал 2)
streamlit run ui.py

# 4. Открыть http://localhost:8501
```

## Использование веб-интерфейса

### 1. Создание эксперимента

1. Откройте http://localhost:8501
2. В сайдбаре выберите "start new"
3. Введите имя эксперимента
4. Выберите модель (Random Forest / Gradient Boosting)
5. Настройте гиперпараметры
6. Загрузите CSV файл с данными
7. Выберите целевую колонку (target)
8. Нажмите "Register Experiment"

### 2. Обучение модели

1. Выберите созданный эксперимент в сайдбаре
2. Нажмите "Train Model"
3. Дождитесь завершения обучения
4. Посмотрите кривые обучения (Learning Curves)

### 3. Инференс

1. Загрузите тестовый CSV файл (без целевой колонки)
2. Получите предсказания модели

### Тестовые данные

```bash
# Для обучения (с целевой колонкой price)
data/test_dataset.csv

# Для инференса (без price)
data/test.csv
```

## Структура проекта

```
├── ensembles/                # ML алгоритмы
│   ├── random_forest.py      # RandomForestMSE
│   ├── boosting.py           # GradientBoostingMSE
│   ├── utils.py              # RMSLE, early stopping
│   ├── backend.py            # ExperimentConfig schema
│   └── frontend.py           # HTTP Client, plot_learning_curves
│
├── backend/                  # FastAPI сервер
│   ├── ml_app.py             # Точка входа
│   └── src/experiments/      # API для экспериментов
│       ├── schemas.py
│       ├── service.py
│       └── router.py
│
├── data/                     # Датасеты
│   ├── kc_house_data.csv     # House Sales (полный)
│   ├── test_dataset.csv      # Тестовый (для обучения)
│   └── test.csv              # Тестовый (для инференса)
│
├── experiments/              # Jupyter эксперименты
│   └── exp.ipynb
│
├── runs/                     # Сохранённые модели
├── ui.py                     # Streamlit интерфейс
├── docker-compose.yml
├── Dockerfile.streamlit
├── requirements.txt
└── .env                      # BASE_URL=http://localhost:8000
```

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/existing_experiments/` | Список экспериментов |
| POST | `/register_experiment/` | Создать эксперимент |
| GET | `/experiment_config/` | Получить конфиг |
| GET | `/needs_training` | Нужно ли обучение |
| POST | `/train/` | Обучить модель |
| GET | `/convergence_history/` | Кривые обучения |
| POST | `/predict/` | Предсказание |
| GET | `/health` | Health check |

## Формат данных

### CSV для обучения

```csv
price,bedrooms,bathrooms,sqft_living,floors
221900,3,1.0,1180,1.0
538000,3,2.25,2570,2.0
```

- Должна быть целевая колонка (например `price`)
- Все признаки должны быть числовыми

### CSV для инференса

```csv
bedrooms,bathrooms,sqft_living,floors
3,1.5,1500,1.0
4,2.5,2200,2.0
```

- Без целевой колонки
- Те же признаки, что при обучении

## Реализованные алгоритмы

### Random Forest

- Bootstrap-сэмплирование
- Усреднение предсказаний
- Early stopping
- Сохранение/загрузка моделей

### Gradient Boosting

- Последовательное обучение на антиградиенте
- Learning rate регуляризация
- Early stopping
- Сохранение/загрузка моделей

## Технологии

- **Backend**: FastAPI, Pydantic, Uvicorn
- **Frontend**: Streamlit, Plotly
- **ML**: NumPy, scikit-learn (DecisionTreeRegressor)
- **Docker**: docker-compose, multi-service

## Авторы

Практикум 317 группы, ММП ВМК МГУ, 2025
