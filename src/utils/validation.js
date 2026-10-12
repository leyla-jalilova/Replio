export function validateEmail(email) {
  if (!email) return 'Email обязателен'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный email'
  return null  // ← null = "ошибки нет"
}

export function validatePassword(password) {
  if (!password) return 'Пароль обязателен'
  if (password.length < 8) return 'Минимум 8 символов'
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return 'Должен содержать буквы и цифры'
  return null
}

export function validateRegisterForm({ email, password }) {
  const errors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError
  return errors
}