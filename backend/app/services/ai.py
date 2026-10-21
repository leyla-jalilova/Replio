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