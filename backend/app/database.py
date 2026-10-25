from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import DATABASE_URL

url = DATABASE_URL
# Neon и другие сервисы дают адрес вида postgresql://...
# SQLAlchemy нужно указать, через какую библиотеку подключаться
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql+psycopg://", 1)
elif url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+psycopg://", 1)

# Эта настройка нужна только для SQLite
connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
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