import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Target,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Settings,
  User,
  Menu,
  X
} from 'lucide-react'
import logo from '../assets/logo.png'
import { getMe, getSavedEmail } from '../api/auth'

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
  // На компьютере меню открыто сразу, на телефоне скрыто
  const [open, setOpen] = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    getMe()
      .then((user) => {
        if (user?.email) setName(nameFromEmail(user.email))
      })
      .catch(() => {})
  }, [])

  // После выбора пункта закрываем меню только на телефоне
  const handleNavClick = () => {
    if (window.innerWidth < 768) setOpen(false)
  }

  return (
    <div className="h-screen flex bg-[#f0f0f0] overflow-hidden">

      {/* Затемнение за меню (только на телефоне, когда меню открыто) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Сайдбар */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white flex flex-col border-r border-gray-200 transition-transform duration-200 md:static ${
          open ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >

        {/* Логотип + кнопка «свернуть» */}
        <div className="p-6 flex items-center justify-between">
          <img src={logo} alt="Replio" className="h-9 w-auto" />
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-800"
            title="Свернуть меню"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Меню */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
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

        {/* Пользователь внизу */}
        <div className="p-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">{name}</p>
              <p className="text-xs text-gray-500">Руководитель</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Правая часть: полоса с ☰ (когда меню скрыто) + страница */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {!open && (
          <header className="h-14 shrink-0 bg-white border-b border-gray-200 px-4 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="text-[#1a1a1a]"
              title="Открыть меню"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src={logo} alt="Replio" className="h-7 w-auto" />
          </header>
        )}

        {/* Основной контент */}
        <main className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}