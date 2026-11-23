import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user
from app.services.ai import (
    ask_ai,
    build_system_prompt,
    evaluate_conversation,
    start_conversation,
    EMPLOYEE,
)

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


def is_finished(chat: models.ChatSession, db: Session) -> bool:
    return (
        db.query(models.Attempt)
        .filter(models.Attempt.session_id == chat.id)
        .first()
        is not None
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

    # Generate before creating the session so a failed AI request does not
    # leave an empty chat in the database.
    try:
        first_message = start_conversation(scenario, user_role=EMPLOYEE)
        if not isinstance(first_message, str) or not first_message.strip():
            raise ValueError("ИИ вернул пустое первое сообщение")
        first_message = first_message.strip()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Не удалось получить первое сообщение ИИ",
        ) from exc

    try:
        chat = models.ChatSession(user_id=user.id, scenario_id=scenario.id)
        db.add(chat)
        db.flush()
        db.add(
            models.Message(
                session_id=chat.id,
                role="assistant",
                content=first_message,
            )
        )
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