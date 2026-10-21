import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

# Секретный ключ для подписи токенов. Потом перенесём его в файл .env
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # токен действует сутки


def hash_password(password: str) -> str:
    # Превращает пароль в хэш для хранения в базе
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    # Проверяет, совпадает ли введённый пароль с хэшем из базы
    return password_hash.verify(password, hashed)


def create_access_token(user_id: int) -> str:
    # Создаёт токен-«браслет» с id пользователя и сроком действия
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)