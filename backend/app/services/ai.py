from openai import OpenAI

from app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

# Клиент для OpenRouter (он понимает тот же формат, что и OpenAI)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


def ask_ai(messages: list[dict]) -> str:
    # Отправляет историю сообщений в нейросеть и возвращает её ответ
    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=messages,
    )
    return response.choices[0].message.content