from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    # Превращает пароль в хэш для хранения в базе
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    # Проверяет, совпадает ли введённый пароль с хэшем из базы
    return password_hash.verify(password, hashed)