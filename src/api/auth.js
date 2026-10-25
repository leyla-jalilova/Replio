const API_URL = import.meta.env.VITE_API_URL || ''

async function errorMessage(res, fallback) {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((e) => e.msg || JSON.stringify(e)).join(', ')
    }
    return fallback
  } catch {
    return `${fallback} (статус ${res.status})`
  }
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await errorMessage(res, 'Ошибка входа'))

  const data = await res.json()
  localStorage.setItem('token', data.access_token)
  localStorage.setItem('email', email)   // ← сохраняем email
  return data
}

export async function registerUser({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await errorMessage(res, 'Ошибка регистрации'))

  return loginUser({ email, password })
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (res.status === 401) {
    window.location.href = '/'
    return null
  }
  if (!res.ok) throw new Error('Не удалось загрузить профиль')
  const user = await res.json()
  if (user?.email) localStorage.setItem('email', user.email)
  return user
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getSavedEmail() {
  return localStorage.getItem('email') || ''
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
}