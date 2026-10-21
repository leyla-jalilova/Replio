from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import UserCreate, UserOut
from app.security import hash_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, нет ли уже пользователя с таким email
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже есть")

    # Создаём пользователя с зашифрованным паролем
    user = models.User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user