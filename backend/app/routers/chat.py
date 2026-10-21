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
    # Находит разговор и проверяет, что он принадлежит этому пользователю
    chat = db.get(models.ChatSession, session_id)
    if chat is None or chat.user_id != user.id:
        raise HTTPException(status_code=404, detail="Разговор не найден")
    return chat


@router.post("/sessions")
def start_chat(
    data: StartChat,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Начинает новый разговор по выбранному сценарию
    scenario = db.get(models.Scenario, data.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    chat = models.ChatSession(user_id=user.id, scenario_id=scenario.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {"session_id": chat.id, "scenario": scenario.title}


@router.post("/sessions/{session_id}/messages")
def send_message(
    session_id: int,
    data: SendMessage,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)

    # Собираем для ИИ: инструкцию + всю прошлую переписку + новое сообщение
    history = [{"role": "system", "content": build_system_prompt(chat.scenario)}]
    history += [{"role": m.role, "content": m.content} for m in chat.messages]
    history.append({"role": "user", "content": data.content})

    try:
        answer = ask_ai(history)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка ИИ: {e}")

    # Сохраняем оба сообщения в базу
    db.add(models.Message(session_id=chat.id, role="user", content=data.content))
    db.add(models.Message(session_id=chat.id, role="assistant", content=answer))
    db.commit()

    return {"answer": answer}


@router.get("/sessions/{session_id}")
def get_chat(
    session_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Возвращает всю переписку разговора
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
    # Завершает разговор: ИИ-тренер оценивает его, результат сохраняется
    chat = get_own_session(session_id, user, db)
    if not chat.messages:
        raise HTTPException(status_code=400, detail="Разговор пустой, сначала напишите сообщения")

    already = db.query(models.Attempt).filter(models.Attempt.session_id == chat.id).first()
    if already:
        raise HTTPException(status_code=400, detail="Этот разговор уже оценён")

    try:
        result = evaluate_conversation(chat.scenario, chat.messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка оценки: {e}")

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