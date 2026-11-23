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
    content = data.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Сообщение не может быть пустым")

    already = db.query(models.Attempt).filter(models.Attempt.session_id == chat.id).first()
    if already:
        raise HTTPException(status_code=400, detail="Разговор уже завершён")

    history = [{"role": "system", "content": manager_prompt(chat.scenario)}]
    # Подсказка помогает моделям, которым нужна реплика user перед первым assistant.
    if chat.messages and chat.messages[0].role == "assistant":
        history.append({
            "role": "user",
            "content": "Служебный сигнал: начни тренировку первым сообщением руководителя.",
        })
    history.extend({"role": m.role, "content": m.content} for m in chat.messages)
    history.append({"role": "user", "content": content})

    try:
        answer = ask_ai(history).strip()
        if not answer:
            raise ValueError("ИИ вернул пустой ответ")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ошибка ИИ: {exc}") from exc

    db.add(models.Message(session_id=chat.id, role="user", content=content))
    db.add(models.Message(session_id=chat.id, role="assistant", content=answer))
    db.commit()
    return {"answer": answer}


@router.get("/sessions/{session_id}")
def get_chat(
    session_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)
    return {
        "session_id": chat.id,
        "scenario": chat.scenario.title,
        "messages": [{"role": m.role, "content": m.content} for m in chat.messages],
    }


@router.post("/sessions/{session_id}/finish")
def finish_chat(
    session_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)
    if not any(m.role == "user" for m in chat.messages):
        raise HTTPException(status_code=400, detail="Сначала ответьте руководителю")

    already = db.query(models.Attempt).filter(models.Attempt.session_id == chat.id).first()
    if already:
        raise HTTPException(status_code=400, detail="Этот разговор уже оценён")

    try:
        result = evaluate_conversation(chat.scenario, chat.messages, user_role="employee")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ошибка оценки: {exc}") from exc

    attempt = models.Attempt(
        user_id=user.id,
        scenario_id=chat.scenario_id,
        session_id=chat.id,
        score=result["score"],
        feedback=json.dumps(result, ensure_ascii=False),
    )
    db.add(attempt)
    db.commit()
    return result
