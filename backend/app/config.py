import os

from dotenv import load_dotenv

# Загружаем переменные из файла .env (на компьютере).
# В интернете (на Render) они задаются в настройках сервиса.
load_dotenv()


def env(name: str, default: str = "") -> str:
    # Читает настройку и убирает случайные пробелы и переносы строк
    return os.getenv(name, default).strip()


OPENROUTER_API_KEY = env("OPENROUTER_API_KEY")
OPENROUTER_MODEL = env("OPENROUTER_MODEL")

# Запасной сервис ИИ (Cloudflare), если OpenRouter перегружен
FALLBACK_API_KEY = env("FALLBACK_API_KEY")
FALLBACK_BASE_URL = env("FALLBACK_BASE_URL")
FALLBACK_MODEL = env("FALLBACK_MODEL")

# База: по умолчанию локальный файл SQLite, в интернете — PostgreSQL
DATABASE_URL = env("DATABASE_URL", "sqlite:///./replio.db")

# Адрес сайта в интернете (нужен, чтобы сервер разрешил ему делать запросы)
FRONTEND_URL = env("FRONTEND_URL")