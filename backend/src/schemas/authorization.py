from datetime import datetime, timedelta, timezone
from typing import List, Optional, Self

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param

from jose import JWTError, jwt

from passlib.context import CryptContext

from src.schemas.config import Config as cfg, settings
from src.database.models import User
from src.users.dao import UsersDAO


async def get_token(request: Request) -> str:
    authorization = request.headers.get("Authorization")
    scheme, param = get_authorization_scheme_param(authorization)
    if not authorization or scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="У пользователя нет доступов",
        )
    return param


class UserAuth:
    _instance = None
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/login')
    secret_key = settings.SECRET_KEY
    algorithm = settings.ALGORITHM
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = object.__new__(cls)
        return cls._instance

    async def is_admin_or_self(
            self,
            token: str = Depends(oauth2_scheme),
            user_id: int = None
    ) -> User:
        current_user_id = await self.get_current_user_id_from_token(token)
        user = await UsersDAO.get(id=int(current_user_id))
        if user.role == cfg.UserRoles.ADMIN or (
                user_id and str(user_id) == current_user_id):
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='У пользователя нет доступов'
        )

    async def get_current_user_id_from_token(self, token: str) -> int:
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[self.algorithm]
            )
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Токен не валидный!')

        expire = payload.get('exp')
        expire_time = datetime.fromtimestamp(int(expire), tz=timezone.utc)
        if (not expire) or (expire_time < datetime.now(timezone.utc)):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Токен истек')

        user_id = payload.get('sub')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Не найден ID пользователя')

        return user_id

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(
            self, plain_password: str, hashed_password: str
    ) -> None:
        if not self.pwd_context.verify(plain_password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='Неверная почта или пароль'
            )

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=30)
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(
            to_encode, self.secret_key, algorithm=self.algorithm
        )
        return encode_jwt


auth = UserAuth()


class UserDependency(UserAuth):
    requires_roles = cfg.UserRoles

    def __new__(cls, *args: object, **kwargs: object) -> Self:
        return object.__new__(cls)

    def __init__(
            self, requires_roles: Optional[List[cfg.UserRoles]] = None
    ) -> None:
        if requires_roles:
            self.requires_roles = requires_roles

    async def __call__(
            self,
            request: Request,
            token: str = Depends(UserAuth.oauth2_scheme)
    ) -> User:
        current_user_id = await self.get_current_user_id_from_token(token)
        user = await UsersDAO.get(id=int(current_user_id))

        if user.role not in self.requires_roles:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='У пользователя нет доступов'
            )
        request.state.user = user
        return user
