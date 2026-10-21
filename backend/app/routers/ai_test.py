from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai import ask_ai

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AskData(BaseModel):
    message: str


@router.post("/test")
def test_ai(data: AskData):
    messages = [
        {
            "role": "system",
            "content": (
                "Ты сотрудник компании. Руководитель вызвал тебя на разговор, "
                "потому что ты сдал проект с ошибками. Ты немного нервничаешь "
                "и защищаешься. Отвечай коротко, по-русски, как живой человек."
            ),
        },
        {"role": "user", "content": data.message},
    ]
    try:
        answer = ask_ai(messages)
    except Exception as e:
        # Если нейросеть не ответила, показываем причину
        raise HTTPException(status_code=502, detail=f"Ошибка ИИ: {e}")
    return {"answer": answer}