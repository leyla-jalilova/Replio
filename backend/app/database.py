from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# База — это файл replio.db в папке backend
DATABASE_URL = "sqlite:///./replio.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    # Открывает соединение с базой на время одного запроса
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()