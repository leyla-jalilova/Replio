import json
from openai import OpenAI

from app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

# Клиент для OpenRouter (он понимает тот же формат, что и OpenAI)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Можно указать несколько моделей через запятую: если первая занята,
# OpenRouter сам попробует следующую
MODELS = [m.strip() for m in OPENROUTER_MODEL.split(",") if m.strip()]


def ask_ai(messages: list[dict]) -> str:
    # Отправляет историю сообщений в нейросеть и возвращает её ответ
    extra = {"models": MODELS} if len(MODELS) > 1 else None
    response = client.chat.completions.create(
        model=MODELS[0],
        messages=messages,
        extra_body=extra,
    )
    return response.choices[0].message.content


def build_system_prompt(scenario) -> str:
    # Инструкция для ИИ: кого он играет в этом сценарии
    return (
        "Ты участвуешь в тренажёре сложных разговоров для руководителей. "
        "Ты играешь роль сотрудника, с которым руководитель ведёт разговор.\n"
        f"Ситуация: {scenario.title}. {scenario.description}\n"
        "Правила: всё время оставайся в роли сотрудника. Отвечай по-русски, "
        "коротко (1–3 предложения), естественно и с эмоциями, как живой человек. "
        "Не помогай руководителю и не давай ему советов, а реагируй на его слова. "
        "Если руководитель груб или не слушает, становись напряжённее; "
        "если проявляет понимание, постепенно смягчайся."
    )


def evaluate_conversation(scenario, messages) -> dict:
    # Второй ИИ в роли бизнес-тренера оценивает весь разговор
    dialog = "\n".join(
        f"{'Руководитель' if m.role == 'user' else 'Сотрудник'}: {m.content}"
        for m in messages
    )
    prompt = [
        {
            "role": "system",
            "content": (
                "Ты опытный бизнес-тренер. Оцени, как руководитель провёл сложный "
                "разговор с сотрудником. Учитывай: ясность, эмпатию, уважение, "
                "умение слушать, конструктивность и достижение цели разговора.\n"
                "Ответь ТОЛЬКО в формате JSON, без текста вокруг:\n"
                '{"score": число от 1 до 10, "strengths": ["..."], '
                '"improvements": ["..."], "summary": "..."}\n'
                "Пиши по-русски."
            ),
        },
        {
            "role": "user",
            "content": f"Сценарий: {scenario.title}. {scenario.description}\n\nДиалог:\n{dialog}",
        },
    ]
    raw = ask_ai(prompt)

    # Вырезаем JSON из ответа (на случай, если ИИ добавил лишний текст)
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"ИИ вернул не JSON: {raw}")
    result = json.loads(raw[start : end + 1])

    # Следим, чтобы балл был от 1 до 10
    result["score"] = max(1.0, min(10.0, float(result.get("score", 1))))
    return result