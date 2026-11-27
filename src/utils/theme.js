const KEY = 'theme'

// 'light' или 'dark' (по умолчанию светлая)
export function getTheme() {
  return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  // Сигнал для MainLayout, чтобы он сразу перекрасился
  window.dispatchEvent(new Event('theme-change'))
}