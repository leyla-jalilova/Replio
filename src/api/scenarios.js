import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function request(path, options = {}, fallback = 'Что-то пошло не так') {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (res.status === 401) {
    window.location.href = '/'
    return null
  }
  if (!res.ok) {
    let message = fallback
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') message = data.detail
    } catch {
      // ответ не JSON, оставляем текст по умолчанию
    }
    throw new Error(message)
  }
  return res.json()
}

// Список всех сценариев
export function getScenarios() {
  return request('/api/scenarios', {}, 'Не удалось загрузить сценарии')
}

// Начать разговор: возвращает { session_id, scenario }
export function startChat(scenarioId) {
  return request(
    '/api/chat/sessions',
    { method: 'POST', body: JSON.stringify({ scenario_id: scenarioId }) },
    'Не удалось начать разговор'
  )
}

// Выбирает случайный сценарий и сразу создаёт разговор
export async function startRandomChat() {
  const list = await getScenarios()
  if (!list || list.length === 0) throw new Error('Нет доступных сценариев')
  const random = list[Math.floor(Math.random() * list.length)]
  return startChat(random.id)
}