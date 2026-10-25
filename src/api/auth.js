const API_URL = import.meta.env.VITE_API_URL || ''

// Достаёт понятный текст ошибки из ответа сервера
async function errorMessage(res, fallback) {
  const data = await res.json().catch(() => ({}))
  return typeof data.detail === 'string' ? data.detail : fallback
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await errorMessage(res, 'Ошибка входа'))

  const data = await res.json()
  // Сохраняем токен в браузере, чтобы прикладывать его к запросам
  localStorage.setItem('token', data.access_token)
  return data
}

export async function registerUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await errorMessage(res, 'Ошибка регистрации'))

  // После регистрации сразу входим, чтобы получить токен
  return loginUser({ email, password })
}

export function getToken() {
  return localStorage.getItem('token')
}

export function logout() {
  localStorage.removeItem('token')
}