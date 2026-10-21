from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine, SessionLocal
from app.routers import progress, scenarios, auth, ai_test, chat

# Создаём таблицы в базе, если их ещё нет
Base.metadata.create_all(bind=engine)


def seed_scenarios():
    # Заполняем сценарии при первом запуске
    db = SessionLocal()
    if db.query(models.Scenario).count() == 0:
        db.add_all([
            models.Scenario(
                title="Обратная связь",
                description="Сотрудник сдал проект с ошибками. Нужно дать ему обратную связь, не демотивировав.",
            ),
            models.Scenario(
                title="Конфликт",
                description="Двое коллег поссорились из-за распределения задач. Нужно помочь им договориться.",
            ),
            models.Scenario(
                title="Демотивация",
                description="Сильный сотрудник потерял интерес к работе. Нужно выяснить причину.",
            ),
            models.Scenario(
                title="Увольнение",
                description="Нужно сообщить сотруднику об увольнении спокойно и уважительно.",
            ),
        ])
        db.commit()
    db.close()


seed_scenarios()

app = FastAPI(title="Replio API")

# разрешаем фронту на React обращаться к серверу
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(progress.router)
app.include_router(scenarios.router)
app.include_router(auth.router)
app.include_router(ai_test.router)
app.include_router(chat.router)