from src.schemas.authorization import auth
from src.users.schemas import UserRegister


def prepare_user_data(
        user_data: UserRegister
) -> dict:
    """Подготовка данных пользователя"""
    user_dict = user_data.dict(exclude_unset=True)
    if user_data.password:
        user_dict["password"] = auth.get_password_hash(
            password=user_data.password
        )
    return user_dict
