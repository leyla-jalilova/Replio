import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user
from app.services.ai import ask_ai, build_system_prompt, evaluate_conversation

router = APIRouter(prefix="/api/chat", tags=["chat"])


class StartChat(BaseModel):
    scenario_id: int


class SendMessage(BaseModel):
    content: str


def get_own_session(session_id: int, user: models.User, db: Session) -> models.ChatSession:
    chat = db.get(models.ChatSession, session_id)
    if chat is None or chat.user_id != user.id:
        raise HTTPException(status_code=404, detail="Разговор не найден")
    return chat


def manager_prompt(scenario) -> str:
    return (
        build_system_prompt(scenario, user_role="employee")
        + "\n\nВАЖНО: Ты руководитель, пользователь — сотрудник. "
        "Пользователь рассказывает о СВОИХ проблемах на работе. "
        "Ты сам начинаешь разговор и спрашиваешь, что случилось. "
        "Выслушивай, задавай по одному уместному уточняющему вопросу, "
        "не уходи от темы выбранного сценария и не говори за пользователя. "
        "Не изображай сотрудника, который жалуется руководителю."
    )


@router.post("/sessions")
def start_chat(
    data: StartChat,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scenario = db.get(models.Scenario, data.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    opening_messages = [
        {"role": "system", "content": manager_prompt(scenario)},
        {
            "role": "user",
            "content": (
                "Служебная команда запуска тренировки (это НЕ реплика сотрудника). "
                "Начни разговор ПЕРВЫМ как руководитель. "
                "Спроси сотрудника, что произошло и что его беспокоит "
                "в рамках выбранного сценария. Не утверждай, что он уже "
                "рассказал о проблеме. 1–3 естественных предложения."
            ),
        },
    ]
    try:
        first_message = ask_ai(opening_messages).strip()
        if not first_message:
            raise ValueError("ИИ вернул пустое первое сообщение")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ошибка запуска ИИ: {exc}") from exc

    chat = models.ChatSession(user_id=user.id, scenario_id=scenario.id)
    try:
        db.add(chat)
        db.flush()
        db.add(models.Message(session_id=chat.id, role="assistant", content=first_message))
        db.commit()
        db.refresh(chat)
    except Exception:
        db.rollback()
        raise

    return {
        "session_id": chat.id,
        "scenario": scenario.title,
        "first_message": first_message,
    }


@router.post("/sessions/{session_id}/messages")
def send_message(
    session_id: int,
    data: SendMessage,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)