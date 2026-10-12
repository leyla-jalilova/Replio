// Заглушка. Когда появится бэк — заменить тело функции на fetch.
export async function registerUser({ email, password }) {
  // Имитация задержки сети, чтобы loading успел показаться
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Пока бэка нет — просто логируем и возвращаем фейковый ответ
  console.log('Регистрация (заглушка):', { email, password })
  return { token: 'fake-token', user: { email } }

  // const res = await fetch('/api/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // })
  // if (!res.ok) {
  //   const data = await res.json()
  //   throw new Error(data.message || 'Ошибка регистрации')
  // }
  // return res.json()
}