
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


def get_own_session(
    session_id: int,
    user: models.User,
    db: Session,
) -> models.ChatSession:
    chat = db.get(models.ChatSession, session_id)

    if chat is None or chat.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="Разговор не найден",
        )

    return chat


def employee_prompt(scenario) -> str:
    return (
        build_system_prompt(scenario, user_role="manager")
        + "\n\nОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ТРЕНИРОВКИ:\n"
        "Ты всегда играешь СОТРУДНИКА компании.\n"
        "Пользователь всегда играет РУКОВОДИТЕЛЯ.\n"
        "Никогда не меняй эти роли.\n"
        "Не обращайся к пользователю по имени.\n"
        "Не называй пользователя именем своего персонажа.\n"
        "Не изображай руководителя.\n"
        "Не оценивай действия руководителя во время разговора.\n"
        "Не давай советы от имени бизнес-тренера.\n"
        "Говори от первого лица как живой сотрудник.\n"
        "Ты можешь испытывать эмоции, спорить, сомневаться "
        "и защищать свою позицию.\n"
        "Реагируй на слова руководителя естественно.\n"
        "Если руководитель проявляет понимание, постепенно "
        "становись более открытым.\n"
        "Если руководитель давит, обвиняет или грубит, "
        "можешь закрываться или возражать.\n"
        "Не соглашайся со всем автоматически.\n"
        "Отвечай на русском языке.\n"
        "Обычно используй 1–4 естественных предложения.\n"
        "Не добавляй пояснений о том, что ты искусственный интеллект.\n"
    )


def opening_prompt(scenario) -> str:
    title = scenario.title.strip().lower()

    openings = {
        "обратная связь": (
            "Ты сотрудник, который допустил ошибки в проекте. "
            "Начни разговор с руководителем первым. "
            "Скажи, что хотел обсудить ситуацию с проектом. "
            "Объясни, что сроки были сжатыми, а требования менялись. "
            "Ты немного расстроен критикой и считаешь, "
            "что ответственность лежит не только на тебе. "
            "Не начинай оценивать работу другого сотрудника."
        ),
        "конфликт": (
            "Ты сотрудница, которая поссорилась с коллегой Денисом. "
            "Начни разговор первой. "
            "Расскажи руководителю, что Денис перекладывает "
            "на тебя часть своих задач и это тебя раздражает. "
            "Попроси помочь разобраться в ситуации. "
            "Не говори за руководителя."
        ),
        "демотивация": (
            "Ты сотрудник, который потерял интерес к работе. "
            "Начни разговор первым. "
            "Скажи руководителю, что последнее время "
            "чувствуешь усталость и работа даётся тяжелее. "
            "Не раскрывай сразу настоящую причину: "
            "выгорание и несостоявшееся повышение. "
            "Пусть руководитель выясняет её вопросами."
        ),
        "увольнение": (
            "Ты сотрудница, которую руководитель пригласил "
            "на разговор. Ты ещё не знаешь о сокращении. "
            "Начни первой с нейтрального приветствия "
            "и спроси, зачем тебя пригласили. "
            "Не говори, что тебя увольняют. "
            "Не сообщай руководителю о сокращении "
            "и не принимай решение об увольнении сама."
        ),
    }

    instruction = openings.get(
        title,
        (
            "Начни разговор первым как сотрудник. "
            "Расскажи руководителю о рабочей проблеме "
            "из выбранного сценария. "
            "Попроси помочь разобраться в ситуации."
        ),
    )

    return (
        "Это служебная команда запуска тренировки, "
        "а не реплика руководителя.\n"
        + instruction
        + "\n\nНапиши только первую реплику сотрудника. "
        "Не обращайся к руководителю по имени. "
        "Не изображай руководителя. "
        "Не начинай со слов 'Чем могу помочь?'. "
        "Используй 1–4 естественных предложения."
    )


@router.post("/sessions")
def start_chat(
    data: StartChat,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scenario = db.get(models.Scenario, data.scenario_id)

    if scenario is None:
        raise HTTPException(
            status_code=404,
            detail="Сценарий не найден",
        )

    opening_messages = [
        {
            "role": "system",
            "content": employee_prompt(scenario),
        },
        {
            "role": "user",
            "content": opening_prompt(scenario),
        },
    ]

    try:
        first_message = ask_ai(opening_messages).strip()

        if not first_message:
            raise ValueError(
                "ИИ вернул пустое первое сообщение"
            )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ошибка запуска ИИ: {exc}",
        ) from exc

    chat = models.ChatSession(
        user_id=user.id,
        scenario_id=scenario.id,
    )

    try:
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
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)

    content = data.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Сообщение не может быть пустым",
        )

    already = (
        db.query(models.Attempt)
        .filter(models.Attempt.session_id == chat.id)
        .first()
    )

    if already:
        raise HTTPException(
            status_code=400,
            detail="Разговор уже завершён",
        )

    history = [
        {
            "role": "system",
            "content": employee_prompt(chat.scenario),
        }
    ]

    # Сохраняем контекст первой реплики ИИ.
    if chat.messages and chat.messages[0].role == "assistant":
        history.append(
            {
                "role": "user",
                "content": opening_prompt(chat.scenario),
            }
        )

    history.extend(
        {
            "role": message.role,
            "content": message.content,
        }
        for message in chat.messages
    )

    history.append(
        {
            "role": "user",
            "content": content,
        }
    )

    try:
        answer = ask_ai(history).strip()

        if not answer:
            raise ValueError("ИИ вернул пустой ответ")

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ошибка ИИ: {exc}",
        ) from exc

    try:
        db.add(
            models.Message(
                session_id=chat.id,
                role="user",
                content=content,
            )
        )

        db.add(
            models.Message(
                session_id=chat.id,
                role="assistant",
                content=answer,
            )
        )

        db.commit()

    except Exception:
        db.rollback()
        raise

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
        "messages": [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in chat.messages
        ],
    }


@router.post("/sessions/{session_id}/finish")
def finish_chat(
    session_id: int,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = get_own_session(session_id, user, db)

    if not any(
        message.role == "user"
        for message in chat.messages
    ):
        raise HTTPException(
            status_code=400,
            detail="Сначала ответьте сотруднику",
        )

    already = (
        db.query(models.Attempt)
        .filter(models.Attempt.session_id == chat.id)
        .first()
    )

    if already:
        raise HTTPException(
            status_code=400,
            detail="Этот разговор уже оценён",
        )

    try:
        result = evaluate_conversation(
            chat.scenario,
            chat.messages,
            user_role="manager",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ошибка оценки: {exc}",
        ) from exc

    attempt = models.Attempt(
        user_id=user.id,
        scenario_id=chat.scenario_id,
        session_id=chat.id,
        score=result["score"],
        feedback=json.dumps(
            result,
            ensure_ascii=False,
        ),
    )

    try:
        db.add(attempt)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return result
