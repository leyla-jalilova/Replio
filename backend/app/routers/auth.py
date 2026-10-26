from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user
from app.schemas import LoginData, Token, UserCreate, UserOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, нет ли уже пользователя с таким email
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже есть")

    # Создаём пользователя с зашифрованным паролем
    user = models.User(
        email=data.email,
        name=data.name.strip(),
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    # Ищем пользователя и проверяем пароль
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
def me(user: models.User = Depends(get_current_user)):
    # Возвращает того, чей токен пришёл
    return user