import { PenLine, Users } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">

      {/* Большой логотип по центру */}
      <div className="mb-8">
        <img src={logo} alt="Replio" className="h-20 w-auto opacity-90" />
      </div>

      {/* Приветствие */}
      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-10 text-center">
        Добро Пожаловать, Полина
      </h1>

      {/* Две карточки */}
      <div className="flex gap-6 flex-wrap justify-center">

        {/* Карточка 1 */}
        <div className="bg-white rounded-2xl p-6 w-72 shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <PenLine className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-[#1a1a1a] mb-1">
            Начать тренировку
          </h3>
          <p className="text-sm text-gray-500">
            Запустите управляемую сессию с ИИ-сотрудником
          </p>
        </div>

        {/* Карточка 2 */}
        <div className="bg-white rounded-2xl p-6 w-72 shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-[#1a1a1a] mb-1">
            Случайный сценарий
          </h3>
          <p className="text-sm text-gray-500">
            Мгновенно начните непредсказуемый диалог
          </p>
        </div>

      </div>
    </div>
  )
}