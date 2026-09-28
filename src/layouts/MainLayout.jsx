import { NavLink, Outlet } from 'react-router-dom'
import {
  Target,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Settings,
  User
} from 'lucide-react'
import logo from '../assets/logo.png'

const menuItems = [
  { to: '/progress', icon: Target, label: 'Прогресс' },
  { to: '/scenarios', icon: MessageCircle, label: 'Сценарии' },
  { to: '/recommendations', icon: Lightbulb, label: 'Рекомендации' },
  { to: '/library', icon: BookOpen, label: 'Библиотека' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
]

export default function MainLayout() {
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

        {/* Пользователь внизу */}
        <div className="p-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">Дежинская Полина</p>
              <p className="text-xs text-gray-500">Руководитель</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}