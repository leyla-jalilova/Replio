import os

from dotenv import load_dotenv

# Загружаем переменные из файла .env (на компьютере).
# В интернете (на Render) они задаются в настройках сервиса.
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")

# База: по умолчанию локальный файл SQLite, в интернете — PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./replio.db")

# Адрес сайта в интернете (нужен, чтобы сервер разрешил ему делать запросы)
FRONTEND_URL = os.getenv("FRONTEND_URL", "")