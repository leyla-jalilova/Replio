import { getToken } from './auth'

export async function getProgressData() {
  const res = await fetch('/api/progress', {
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