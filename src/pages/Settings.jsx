import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Pencil, Globe, Moon, Bell, Gauge, Lock, ShieldCheck, History,
  Headset, Info, ChevronRight, ChevronDown, LogOut,
} from 'lucide-react'
import { getMe, getSavedEmail, logout } from '../api/auth'
import { getTheme, setTheme } from '../utils/theme'

function nameFromEmail(email) {
  if (!email) return 'Пользователь'
  return email.split('@')[0]
}

// Что сохраняем в браузере и значения по умолчанию
const DEFAULTS = { notifications: true, autosave: true }

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('settings')) }
  } catch {
    return DEFAULTS
  }
}

// Пометка для того, что ещё не готово
function Soon() {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
      Скоро
    </span>
  )
}

// Переключатель-«тумблер»
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-7 rounded-full transition shrink-0 ${
        checked ? 'bg-[#b5aed6]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-7' : ''
        }`}
      />
    </button>
  )
}

// Одна строка настроек: иконка, название, подсказка и что-то справа
function Row({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Icon className="w-6 h-6 text-[#1a1a1a] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1a1a1a]">{title}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(getSavedEmail())
  const [settings, setSettings] = useState(loadSettings)
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    getMe()
      .then((user) => {
        if (user?.email) setEmail(user.email)
      })
      .catch(() => {})
  }, [])

  // Меняем одну настройку и сразу сохраняем все в браузере
  const update = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    localStorage.setItem('settings', JSON.stringify(next))
  }

  // Переключение темы: сохраняет в localStorage и шлёт событие theme-change
  const chooseTheme = (t) => {
    setTheme(t)        // сохраняет + сообщает MainLayout
    setThemeState(t)   // подсвечивает выбранную кнопку
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-6 md:p-8">

      {/* Заголовок + выход */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Настройки</h1>
          <p className="text-gray-500">Персональные настройки вашего аккаунта</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#cbc6dc] text-[#1a1a1a] font-medium hover:bg-[#bdb7d3] transition"
        >
          <LogOut className="w-5 h-5" />
          Выйти из аккаунта
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        {/* Левая колонка */}
        <div className="lg:col-span-3 space-y-5">

          {/* Профиль */}
          <div className="bg-white rounded-3xl p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[#1a1a1a] truncate">{nameFromEmail(email)}</h2>
              <p className="text-sm text-gray-600">Руководитель</p>
              <p className="text-sm text-gray-500 truncate">{email}</p>
            </div>
            <button
              disabled
              title="Скоро"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#cbc6dc] text-sm text-purple-900 opacity-50 cursor-not-allowed"
            >
              <Pencil className="w-4 h-4" />
              Изменить
            </button>
          </div>

          {/* Общие настройки */}
          <h2 className="text-xl font-bold text-[#1a1a1a] pt-1">Общие настройки</h2>
          <div className="bg-white rounded-3xl px-5 py-2 divide-y divide-gray-100">

            <Row icon={Globe} title="Язык интерфейса" hint="Выберите язык приложения">
              <div className="relative">
                <select
                  disabled
                  className="appearance-none bg-[#cbc6dc] rounded-lg pl-4 pr-9 py-2 text-sm text-purple-900 opacity-60 cursor-not-allowed"
                >
                  <option>Русский</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-900 pointer-events-none" />
              </div>
            </Row>

            <Row icon={Moon} title="Тема оформления" hint="Светлая или тёмная тема">
              <div className="flex rounded-lg bg-gray-100 text-sm overflow-hidden">
                {[
                  ['light', 'Светлая'],
                  ['dark', 'Тёмная'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => chooseTheme(key)}
                    className={`px-4 py-2 transition ${
                      theme === key
                        ? 'bg-[#cbc6dc] text-purple-900 font-medium'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Row>

            <Row icon={Bell} title="Уведомления" hint="Получать уведомления о важных событиях">
              <Toggle
                checked={settings.notifications}
                onChange={(v) => update('notifications', v)}
              />
            </Row>

            <Row icon={Gauge} title="Автосохранение" hint="Сохранять изменения автоматически">
              <Toggle
                checked={settings.autosave}
                onChange={(v) => update('autosave', v)}
              />
            </Row>
          </div>

          {/* Безопасность */}
          <h2 className="text-xl font-bold text-[#1a1a1a] pt-1">Безопасность</h2>
          <div className="bg-white rounded-3xl px-5 py-2 divide-y divide-gray-100">

            <Row icon={Lock} title="Изменить пароль" hint="Обновите пароль для вашего аккаунта">
              <Soon />
            </Row>

            <Row
              icon={ShieldCheck}
              title="Двухфакторная аутентификация"
              hint="Добавьте дополнительный уровень защиты"
            >
              <Soon />
            </Row>

            <Row icon={History} title="История входов" hint="Просмотр активности в вашем аккаунте">
              <Soon />
            </Row>
          </div>
        </div>

        {/* Правая колонка: поддержка */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Поддержка</h2>

          <Row icon={Headset} title="Связаться с поддержкой" hint="Мы всегда рядом, чтобы помочь">
            <Soon />
          </Row>

          <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#d9d4ea] p-4 text-sm text-[#3b3366]">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Нужна помощь? База знаний появится здесь совсем скоро.</p>
          </div>
        </div>
      </div>
    </div>
  )
}