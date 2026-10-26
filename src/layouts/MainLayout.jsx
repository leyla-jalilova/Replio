import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Target,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Settings,
  User,
  LogOut,
} from 'lucide-react'
import logo from '../assets/logo.png'
import { getMe, getSavedEmail, logout } from '../api/auth'

function nameFromEmail(email) {
  if (!email) return 'Пользователь'
  return email.split('@')[0]
}

const menuItems = [
  { to: '/progress', icon: Target, label: 'Прогресс' },
  { to: '/scenarios', icon: MessageCircle, label: 'Сценарии' },
  { to: '/recommendations', icon: Lightbulb, label: 'Рекомендации' },
  { to: '/library', icon: BookOpen, label: 'Библиотека' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
]

export default function MainLayout() {
  const [name, setName] = useState(() => nameFromEmail(getSavedEmail()))

  // Состояние для выпадающего меню
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    getMe()
      .then((user) => {
        if (user?.email) setName(nameFromEmail(user.email))
      })
      .catch(() => {})
  }, [])

  // Закрываем меню, если кликнули в любое другое место на экране
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Обработчик выхода
  const handleLogout = () => {
    logout() // Очищает localStorage (токен и email)
    navigate('/register') // Переход на страницу авторизации/регистрации
  }

  return (
    <div className="min-h-screen flex bg-[#f0f0f0]">
      {/* Сайдбар */}
      <aside className="w-64 bg-white flex flex-col border-r border-gray-200">
        {/* Логотип */}
        <div className="p-6">
          <img src={logo} alt="Replio" className="h-9 w-auto" />
        </div>

        {/* Меню */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-gray-200 text-[#1a1a1a]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Блок пользователя с выпадающим меню */}
        <div className="p-4 relative" ref={menuRef}>
          {/* Кнопка, при клике на которую открывается меню */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#1a1a1a] truncate">
                {name}
              </p>
              <p className="text-xs text-gray-500 truncate">Руководитель</p>
            </div>
          </button>

          {/* Само выпадающее меню */}
          {isMenuOpen && (
            <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left"
              >
                <LogOut className="w-4 h-4" />
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}