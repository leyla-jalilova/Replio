import { request } from './scenarios'

// Вся переписка разговора: { session_id, scenario, messages }
export function getChat(sessionId) {
  return request(`/api/chat/sessions/${sessionId}`, {}, 'Не удалось загрузить разговор')
}

// Отправить сообщение, вернёт { answer }
export function sendMessage(sessionId, content) {
  return request(
    `/api/chat/sessions/${sessionId}/messages`,
    { method: 'POST', body: JSON.stringify({ content }) },
    'Не удалось отправить сообщение'
  )
}

// Завершить разговор, вернёт { score, strengths, improvements, summary }
export function finishChat(sessionId) {
  return request(
    `/api/chat/sessions/${sessionId}/finish`,
    { method: 'POST' },
    'Не удалось завершить разговор'
  )
}