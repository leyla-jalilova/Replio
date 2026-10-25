import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function getProgressData() {
  const res = await fetch(`${API_URL}/api/progress`, {
    // Прикладываем токен, как кнопка Authorize в /docs
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  if (res.status === 401) {
    // Не вошли или токен устарел: отправляем на регистрацию
    window.location.href = '/'
    return null
  }
  if (!res.ok) throw new Error('Не удалось загрузить прогресс')

  return res.json()
}