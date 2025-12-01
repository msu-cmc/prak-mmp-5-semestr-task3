# Архитектура сущностей проекта

## Оглавление
1. [Введение](#введение)
2. [Общая структура модуля](#общая-структура-модуля)
3. [Компоненты модуля](#компоненты-модуля)
4. [Базовые классы](#базовые-классы)
5. [Создание новой сущности](#создание-новой-сущности)
6. [FAQ и частые вопросы](#faq-и-частые-вопросы)

---

## Введение

Этот проект построен на основе **FastAPI** с использованием **SQLAlchemy** для работы с базой данных. Архитектура следует паттерну разделения ответственности (Separation of Concerns), где каждый компонент выполняет свою конкретную задачу.

Основные принципы:
- **Модульность**: каждая сущность (users, exercises, workouts и т.д.) находится в отдельной папке
- **Слоистая архитектура**: четкое разделение на слои (модели, схемы, логику доступа к данным, роутеры)
- **Переиспользование кода**: базовые классы предоставляют общую функциональность для всех сущностей
- **Типизация**: использование TypeHints для улучшения читаемости кода

---

## Общая структура модуля

Каждая сущность в проекте организована по следующей структуре:

```
src/
├── database/
│   ├── base.py              # BaseDAO - базовый класс для работы с БД
│   ├── session_manager.py   # SessionManager - менеджер сессий
│   ├── models.py            # SQLAlchemy модели (таблицы БД)
│   └── database.py          # Конфигурация БД
├── schemas/
│   └── base_schemas.py      # Базовые Pydantic схемы (PagePaginate)
├── users/                   # Пример сущности
│   ├── schemas.py           # Pydantic схемы для валидации
│   ├── dao.py               # Data Access Object - логика работы с БД
│   ├── router.py            # FastAPI роутеры (endpoints)
│   └── utils.py             # Вспомогательные функции
├── exercises/               # Другая сущность
├── workouts/                # Еще одна сущность
└── ...
```

---

## Компоненты модуля

### 1. Models (SQLAlchemy модели)

**Расположение**: `src/database/models.py`

**Назначение**: Описание структуры таблиц базы данных.

**Пример** (из `src/database/models.py`):
```python
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer
from src.database.database import Base


class User(Base):
    __tablename__: str = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    role: Mapped[str]
    fio: Mapped[str] = mapped_column()
    email: Mapped[str]
    password: Mapped[str] = mapped_column(nullable=False)
```

**Ключевые моменты**:
- Все модели наследуются от `Base`
- Используется `Mapped` для типизации полей
- `__tablename__` определяет имя таблицы в БД
- `mapped_column()` используется для дополнительных настроек полей

---

### 2. Schemas (Pydantic схемы)

**Расположение**: `src/<entity>/schemas.py`

**Назначение**: Валидация входящих и исходящих данных, сериализация/десериализация.

**Типы схем**:

#### Request схемы (для входящих данных):
```python
class UserRegister(BaseModel):
    """Схема для регистрации пользователя"""
    email: EmailStr = Field(description="Электронная почта")
    password: str = Field(min_length=1, max_length=50, description="Пароль")
    fio: str = Field(description="ФИО")
    role: str = Field(description="Роль")

    @field_validator('password')
    def validate_password(cls, v: str) -> str:
        # Кастомная валидация
        if not password_pattern.match(v):
            raise HTTPException(...)
        return v
```

#### Update схемы (для обновления):
```python
class UserUpdate(UserRegister):
    """Схема для обновления пользователя - все поля опциональны"""
    email: Union[EmailStr, None] = Field(default=None)
    password: Union[str, None] = Field(default=None)
    fio: Union[str, None] = Field(default=None)
    role: Union[str, None] = Field(default=None)
```

#### Response схемы (для ответов API):
```python
class UserResponse(BaseModel):
    """Схема ответа для одного пользователя"""
    id: int
    email: EmailStr
    fio: str
    role: str


class UsersResponse(BaseModel):
    """Схема ответа для списка пользователей с пагинацией"""
    values: List[UserResponse]
    total: int
    page: int
    pages: int
    page_size: int
```

**Ключевые моменты**:
- Request схемы содержат обязательные поля
- Update схемы наследуются от Request, но все поля опциональны
- Response схемы описывают структуру ответа API
- Используйте `@field_validator` для кастомной валидации
- Всегда добавляйте `description` для полей

---

### 3. DAO (Data Access Object)

**Расположение**: `src/<entity>/dao.py`

**Назначение**: Инкапсуляция всей логики работы с базой данных для конкретной сущности.

**Структура**:
```python
from src.database.base import BaseDAO
from src.database.models import User
from src.database.session_manager import SessionManager


class UsersDAO(BaseDAO[User]):
    """DAO для работы с пользователями"""
    model = User  # Обязательно указываем модель

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def create_user(
        cls,
        user_data: UserRegister,
        user_dict: dict,
        session: AsyncSession = None
    ) -> User:
        """Создание пользователя"""
        return await cls.create(session=session, **user_dict)

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def update_user(
        cls,
        session: AsyncSession,
        user_id: int,
        user_data: UserUpdate,
        user_dict: dict
    ) -> None:
        """Обновление пользователя"""
        await cls.update(session=session, id=user_id, **user_dict)

    @classmethod
    @SessionManager.with_session(auto_commit=False)
    async def user_paginate(
        cls,
        session: AsyncSession,
        page: int = 1,
        page_size: int = -1,
        search_query: Optional[str] = None,
        search_fields: Optional[list] = None,
        alphabet_sort: bool = True,
        **filters: Any
    ) -> PagePaginate:
        """Пагинация пользователей с фильтрацией"""
        query = select(cls.model)

        # Кастомная сортировка
        if alphabet_sort:
            query = query.order_by(func.lower(cls.model.fio))
        else:
            query = query.order_by(desc(func.lower(cls.model.fio)))

        return await super().paginate(
            session=session,
            page=page,
            page_size=page_size,
            search_query=search_query,
            search_fields=search_fields,
            base_query=query,
            **{k: v for k, v in filters.items() if v is not None}
        )
```

**Ключевые моменты**:
- DAO наследуется от `BaseDAO[ModelType]` с указанием типа модели
- Обязательно указать `model = YourModel`
- Все методы должны быть `@classmethod` и `async`
- Используйте декоратор `@SessionManager.with_session()` для управления сессиями
- `auto_commit=True` для операций изменения данных (create, update, delete)
- `auto_commit=False` для операций чтения (get, paginate)

---

### 4. Router (FastAPI роутеры)

**Расположение**: `src/<entity>/router.py`

**Назначение**: Определение HTTP endpoints и обработка запросов.

**Структура**:
```python
from fastapi import APIRouter, Depends, Query
from src.users.dao import UsersDAO
from src.users.schemas import UserRegister, UserResponse, UsersResponse


# Создание роутера
user_router = APIRouter(prefix='/api/users', tags=['Users'])


@user_router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserRegister,
    # _=Depends(UserDependency([cfg.UserRoles.ADMIN]))  # Опционально: проверка прав
) -> User:
    """Создание нового пользователя"""
    user_dict = prepare_user_data(user_data)
    user = await UsersDAO.create_user(user_data, user_dict)
    return await UsersDAO.get(id=user.id)


@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
) -> User:
    """Обновление пользователя"""
    user_dict = prepare_user_data(user_data)
    await UsersDAO.update_user(
        user_id=user_id,
        user_data=user_data,
        user_dict=user_dict
    )
    return await UsersDAO.get(id=user_id)


@user_router.get("/", response_model=UsersResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(-1, ge=-1, le=100, description="Количество на странице"),
    query: Optional[str] = Query(None, description="Поиск по ФИО"),
    role: Optional[str] = Query(None, description="Фильтр по роли"),
) -> PagePaginate:
    """Получение списка пользователей с фильтрацией и пагинацией"""
    return await UsersDAO.user_paginate(
        page=page,
        page_size=page_size,
        search_query=query,
        search_fields=['fio'],
        role=role,
    )


@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int) -> User:
    """Получение пользователя по ID"""
    return await UsersDAO.get(id=user_id)


@user_router.delete("/{user_id}", response_model=UserResponse)
async def delete_user(user_id: int) -> User:
    """Удаление пользователя"""
    user = await UsersDAO.get(id=user_id)
    await UsersDAO.delete(id=user_id)
    return user
```

**Ключевые моменты**:
- Один роутер на сущность с уникальным prefix
- Используйте `response_model` для автоматической валидации ответов
- Стандартные CRUD операции:
  - POST `/` - создание
  - GET `/` - список с пагинацией
  - GET `/{id}` - получение по ID
  - PUT `/{id}` - обновление
  - DELETE `/{id}` - удаление
- Используйте `Query()` для параметров запроса с описанием
- Всегда добавляйте docstring к endpoints

---

### 5. Utils (вспомогательные функции)

**Расположение**: `src/<entity>/utils.py`

**Назначение**: Вспомогательные функции для преобразования данных, валидации и т.д.

**Пример**:
```python
from src.schemas.authorization import auth
from src.users.schemas import UserRegister


def prepare_user_data(user_data: UserRegister) -> dict:
    """Подготовка данных пользователя перед сохранением"""
    user_dict = user_data.dict(exclude_unset=True)
    if user_data.password:
        # Хеширование пароля
        user_dict['password'] = auth.get_password_hash(user_data.password)
    return user_dict
```

**Ключевые моменты**:
- Используйте utils для логики, не относящейся напрямую к БД
- Типичные случаи: хеширование паролей, форматирование данных, бизнес-логика
- Держите функции небольшими и специфичными

---

## Базовые классы

### BaseDAO

**Расположение**: `src/database/base.py`

**Назначение**: Предоставляет базовую функциональность для работы с БД всем DAO.

**Основные методы**:

#### CRUD операции:
```python
# Создание
await UsersDAO.create(session=session, email="test@test.com", fio="Иван Иванов")

# Чтение
user = await UsersDAO.get(id=1)

# Обновление
await UsersDAO.update(session=session, id=1, fio="Петр Петров")

# Удаление
await UsersDAO.delete(id=1)
```

#### Массовые операции:
```python
# Массовое создание
users = await UsersDAO.create_many(
    session=session,
    values_list=[
        {"email": "user1@test.com", "fio": "User 1"},
        {"email": "user2@test.com", "fio": "User 2"},
    ]
)

# Массовое обновление
await UsersDAO.update_many(
    session=session,
    values_list=[
        {"id": 1, "fio": "New Name 1"},
        {"id": 2, "fio": "New Name 2"},
    ]
)

# Массовое удаление
await UsersDAO.delete_many(session=session, ids=[1, 2, 3])
```

#### Пагинация:
```python
result = await UsersDAO.paginate(
    session=session,
    page=1,                           # Номер страницы
    page_size=10,                     # Размер страницы (-1 для всех)
    search_query="иван",              # Поисковый запрос
    search_fields=['fio', 'email'],   # Поля для поиска
    role="admin",                     # Дополнительные фильтры
)
# result.values - список записей
# result.total - общее количество
# result.page - текущая страница
# result.pages - всего страниц
# result.page_size - размер страницы
```

#### Подсчет записей:
```python
count = await UsersDAO.count_number(role="admin")
```

**Параметры методов**:
- `session` (AsyncSession): сессия БД (управляется SessionManager)
- `returning` (bool): возвращать объект или только количество строк (по умолчанию True)
- `**filters`: фильтры по полям модели

---

### SessionManager

**Расположение**: `src/database/session_manager.py`

**Назначение**: Управление жизненным циклом сессий БД, автоматическая обработка транзакций и ошибок.

**Использование**:

```python
@classmethod
@SessionManager.with_session(auto_commit=True)
async def create_user(
    cls,
    session: AsyncSession,
    user_data: dict
) -> User:
    # session автоматически создается и управляется
    # при auto_commit=True изменения автоматически коммитятся
    return await cls.create(session=session, **user_data)
```

**Параметры декоратора**:
- `auto_commit=True`: автоматический commit для операций изменения (create, update, delete)
- `auto_commit=False`: без commit для операций чтения (get, paginate)

**Как это работает**:
1. Если `session` передана в метод - использует её
2. Если `session=None` - создает новую сессию автоматически
3. При `auto_commit=True` создает транзакцию и делает commit
4. При возникновении ошибки автоматически делает rollback
5. Обрабатывает ошибки через `DatabaseErrorHandler`

**Важно**:
- Всегда используйте `session: AsyncSession = None` в сигнатуре метода
- Декоратор должен быть после `@classmethod`
- Не делайте ручной commit/rollback

---

## Создание новой сущности

### Шаг 1: Создание модели

В `src/database/models.py` добавьте новую модель:

```python
class Exercise(Base):
    __tablename__ = "exercise"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column(nullable=True)
    difficulty: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

### Шаг 2: Создание структуры модуля

Создайте папку для новой сущности:

```bash
mkdir src/exercises
touch src/exercises/schemas.py
touch src/exercises/dao.py
touch src/exercises/router.py
touch src/exercises/utils.py
```

### Шаг 3: Определение схем

В `src/exercises/schemas.py`:

```python
from typing import List, Optional
from pydantic import BaseModel, Field


# REQUEST СХЕМЫ
class ExerciseCreate(BaseModel):
    """Схема для создания упражнения"""
    name: str = Field(description="Название упражнения")
    description: Optional[str] = Field(None, description="Описание")
    difficulty: str = Field(description="Сложность: easy, medium, hard")


class ExerciseUpdate(ExerciseCreate):
    """Схема для обновления упражнения"""
    name: Optional[str] = Field(None, description="Название упражнения")
    difficulty: Optional[str] = Field(None, description="Сложность")


# RESPONSE СХЕМЫ
class ExerciseResponse(BaseModel):
    """Схема ответа для одного упражнения"""
    id: int
    name: str
    description: Optional[str]
    difficulty: str


class ExercisesResponse(BaseModel):
    """Схема ответа для списка упражнений"""
    values: List[ExerciseResponse]
    total: int
    page: int
    pages: int
    page_size: int
```

### Шаг 4: Создание DAO

В `src/exercises/dao.py`:

```python
from typing import Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.base import BaseDAO
from src.database.models import Exercise
from src.database.session_manager import SessionManager
from src.schemas.base_schemas import PagePaginate


class ExercisesDAO(BaseDAO[Exercise]):
    model = Exercise

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def create_exercise(
        cls,
        session: AsyncSession,
        exercise_data: dict
    ) -> Exercise:
        """Создание упражнения"""
        return await cls.create(session=session, **exercise_data)

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def update_exercise(
        cls,
        session: AsyncSession,
        exercise_id: int,
        exercise_data: dict
    ) -> Exercise:
        """Обновление упражнения"""
        return await cls.update(session=session, id=exercise_id, **exercise_data)

    @classmethod
    @SessionManager.with_session(auto_commit=False)
    async def exercise_paginate(
        cls,
        session: AsyncSession,
        page: int = 1,
        page_size: int = -1,
        search_query: Optional[str] = None,
        **filters: Any
    ) -> PagePaginate:
        """Пагинация упражнений"""
        query = select(cls.model)

        return await super().paginate(
            session=session,
            page=page,
            page_size=page_size,
            search_query=search_query,
            search_fields=['name', 'description'],
            base_query=query,
            **{k: v for k, v in filters.items() if v is not None}
        )
```

### Шаг 5: Создание роутера

В `src/exercises/router.py`:

```python
from typing import Optional
from fastapi import APIRouter, Query

from src.database.models import Exercise
from src.exercises.dao import ExercisesDAO
from src.exercises.schemas import (
    ExerciseCreate, ExerciseResponse, ExercisesResponse, ExerciseUpdate
)


exercise_router = APIRouter(prefix='/api/exercises', tags=['Exercises'])


@exercise_router.post("/", response_model=ExerciseResponse)
async def create_exercise(exercise_data: ExerciseCreate) -> Exercise:
    """Создание нового упражнения"""
    exercise_dict = exercise_data.dict(exclude_unset=True)
    return await ExercisesDAO.create_exercise(exercise_data=exercise_dict)


@exercise_router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: int,
    exercise_data: ExerciseUpdate
) -> Exercise:
    """Обновление упражнения"""
    exercise_dict = exercise_data.dict(exclude_unset=True)
    return await ExercisesDAO.update_exercise(
        exercise_id=exercise_id,
        exercise_data=exercise_dict
    )


@exercise_router.get("/", response_model=ExercisesResponse)
async def get_exercises(
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(10, ge=-1, le=100, description="Размер страницы"),
    query: Optional[str] = Query(None, description="Поиск по названию"),
    difficulty: Optional[str] = Query(None, description="Фильтр по сложности")
) -> ExercisesResponse:
    """Получение списка упражнений"""
    return await ExercisesDAO.exercise_paginate(
        page=page,
        page_size=page_size,
        search_query=query,
        difficulty=difficulty
    )


@exercise_router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(exercise_id: int) -> Exercise:
    """Получение упражнения по ID"""
    return await ExercisesDAO.get(id=exercise_id)


@exercise_router.delete("/{exercise_id}", response_model=ExerciseResponse)
async def delete_exercise(exercise_id: int) -> Exercise:
    """Удаление упражнения"""
    exercise = await ExercisesDAO.get(id=exercise_id)
    await ExercisesDAO.delete(id=exercise_id)
    return exercise
```

### Шаг 6: Создание utils (опционально)

В `src/exercises/utils.py`:

```python
from src.exercises.schemas import ExerciseCreate


def prepare_exercise_data(exercise_data: ExerciseCreate) -> dict:
    """Подготовка данных упражнения"""
    exercise_dict = exercise_data.dict(exclude_unset=True)
    # Дополнительная обработка при необходимости
    return exercise_dict
```

### Шаг 7: Регистрация роутера

В главном файле приложения (например, `main.py` или `app.py`):

```python
from src.exercises.router import exercise_router

app = FastAPI()
app.include_router(exercise_router)
```

### Шаг 8: Создание миграции

```bash
alembic revision --autogenerate -m "Add exercises table"
alembic upgrade head
```

---

## FAQ и частые вопросы

### 1. Когда использовать auto_commit=True, а когда False?

**auto_commit=True** - для операций, которые изменяют данные:
- create, create_many
- update, update_many
- delete, delete_many
- Любые кастомные методы, которые модифицируют БД

**auto_commit=False** - для операций чтения:
- get
- paginate
- count_number
- Любые SELECT запросы

### 2. Нужно ли создавать кастомные методы в DAO?

Создавайте кастомные методы в следующих случаях:
- Сложная бизнес-логика перед/после операции с БД
- Работа с несколькими таблицами (JOIN'ы)
- Кастомные запросы с особыми условиями
- Специфичная пагинация или сортировка

Используйте базовые методы напрямую для простых CRUD операций.

### 3. Как работать с связями (relationships)?

Добавьте relationship в модель:

```python
from sqlalchemy.orm import relationship

class Workout(Base):
    __tablename__ = "workout"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="workouts")
```

И используйте options в DAO для eager loading:

```python
from sqlalchemy.orm import selectinload

class WorkoutsDAO(BaseDAO[Workout]):
    model = Workout
    options = [selectinload(Workout.user)]  # Загружать user вместе с workout
```

### 4. Как добавить кастомную валидацию в схемы?

Используйте `@field_validator`:

```python
from pydantic import field_validator

class ExerciseCreate(BaseModel):
    difficulty: str

    @field_validator('difficulty')
    def validate_difficulty(cls, v: str) -> str:
        if v not in ['easy', 'medium', 'hard']:
            raise ValueError('Difficulty must be easy, medium, or hard')
        return v
```

### 5. Как передать существующую сессию в DAO?

Просто передайте её явно:

```python
async with async_session_maker() as session:
    async with session.begin():
        user = await UsersDAO.create_user(session=session, ...)
        await WorkoutsDAO.create_workout(session=session, user_id=user.id, ...)
        # Обе операции в одной транзакции
```

### 6. Как сделать поиск по нескольким полям?

Используйте параметр `search_fields` в методе paginate:

```python
await UsersDAO.paginate(
    search_query="иван",
    search_fields=['fio', 'email']  # Будет искать в обоих полях
)
```

### 7. Нужно ли закрывать сессию вручную?

Нет! `SessionManager` автоматически управляет жизненным циклом сессии. Не нужно делать:
- `session.close()`
- `session.commit()`
- `session.rollback()`

Все это делается автоматически.

### 8. Как обработать ошибки БД?

`SessionManager` автоматически обрабатывает ошибки через `DatabaseErrorHandler`. Он:
- Логирует ошибки
- Делает rollback при необходимости
- Преобразует SQL ошибки в HTTP exceptions

Для кастомной обработки добавьте try/except в методе роутера:

```python
@user_router.post("/")
async def create_user(user_data: UserRegister):
    try:
        return await UsersDAO.create_user(user_data)
    except HTTPException as e:
        # Кастомная обработка
        raise HTTPException(status_code=409, detail="User already exists")
```

### 9. Как добавить сортировку?

Для кастомной сортировки переопределите метод пагинации:

```python
@classmethod
@SessionManager.with_session(auto_commit=False)
async def user_paginate(cls, session: AsyncSession, sort_by: str = 'fio', **kwargs):
    query = select(cls.model)

    # Кастомная сортировка
    if sort_by == 'fio':
        query = query.order_by(func.lower(cls.model.fio))
    elif sort_by == 'created_at':
        query = query.order_by(desc(cls.model.created_at))

    return await super().paginate(session=session, base_query=query, **kwargs)
```

### 10. Когда создавать utils.py?

Создавайте utils.py когда:
- Нужна предобработка данных (хеширование паролей, форматирование)
- Есть вспомогательные функции, используемые в нескольких местах
- Нужна бизнес-логика, не связанная напрямую с БД

Если утилиты нет - не создавайте пустой файл.

### 11. Как работать с page_size=-1?

`page_size=-1` отключает пагинацию и возвращает все записи. Используйте с осторожностью!

```python
# Получить всех пользователей без пагинации
result = await UsersDAO.paginate(page_size=-1)
```

### 12. Нужно ли создавать response модель для каждого endpoint?

Рекомендуется для:
- Чистоты API (пользователь видит только нужные поля)
- Безопасности (скрытие password, внутренних полей)
- Документации (автоматическая генерация OpenAPI схемы)

Но можно использовать одну схему для нескольких endpoint'ов.

### 13. Как добавить middleware для логирования?

Это выходит за рамки архитектуры сущностей, но middleware добавляются в основной файл приложения:

```python
from fastapi import FastAPI
from src.middleware.logging import LoggingMiddleware

app = FastAPI()
app.add_middleware(LoggingMiddleware)
```

### 14. Можно ли переопределить базовые методы BaseDAO?

Да, просто переопределите нужный метод в вашем DAO:

```python
class UsersDAO(BaseDAO[User]):
    model = User

    @classmethod
    @SessionManager.with_session(auto_commit=True)
    async def delete(cls, session: AsyncSession, id: int, **kwargs):
        # Кастомная логика перед удалением
        user = await cls.get(id=id)
        if user.role == "admin":
            raise HTTPException(status_code=403, detail="Cannot delete admin")

        # Вызов базовой реализации
        return await super().delete(session=session, id=id, **kwargs)
```

---

## Чек-лист создания новой сущности

- [ ] Создана SQLAlchemy модель в `src/database/models.py`
- [ ] Создана папка `src/<entity>/`
- [ ] Созданы схемы в `src/<entity>/schemas.py`:
  - [ ] Request схема (Create)
  - [ ] Update схема
  - [ ] Response схема (одиночная)
  - [ ] Response схема (список с пагинацией)
- [ ] Создан DAO в `src/<entity>/dao.py`:
  - [ ] Указана модель `model = YourModel`
  - [ ] Наследование от `BaseDAO[YourModel]`
  - [ ] Методы с правильными декораторами
- [ ] Создан роутер в `src/<entity>/router.py`:
  - [ ] POST / - создание
  - [ ] GET / - список
  - [ ] GET /{id} - получение
  - [ ] PUT /{id} - обновление
  - [ ] DELETE /{id} - удаление
- [ ] Создан utils.py (если нужен)
- [ ] Роутер зарегистрирован в главном приложении
- [ ] Создана и применена миграция Alembic
- [ ] Добавлены тесты (опционально)

---

## Дополнительные ресурсы

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 документация](https://docs.sqlalchemy.org/en/20/)
- [Pydantic документация](https://docs.pydantic.dev/)

---

**Последнее обновление**: 2025-10-30