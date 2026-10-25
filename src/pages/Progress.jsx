import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Calendar, Star, AlertTriangle } from 'lucide-react'
import { getProgressData } from '../api/progress'

// Цвет плашки с оценкой
function scoreColor(score) {
  if (score >= 8) return 'bg-green-100 text-green-700'
  if (score >= 5) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

// Текст про изменение среднего балла за неделю
function averageChangeText(value) {
  if (value > 0) return { text: `↑ +${value} за последнюю неделю`, color: 'text-green-600' }
  if (value < 0) return { text: `↓ ${value} за последнюю неделю`, color: 'text-red-500' }
  return { text: 'Без изменений за неделю', color: 'text-gray-500' }
}

export default function Progress() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  // При открытии страницы загружаем прогресс с сервера
  useEffect(() => {
    getProgressData().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!data) return <div className="p-8 text-gray-500">Загрузка...</div>

  const { stats, chartData, recentAttempts } = data
  const avgChange = averageChangeText(stats.averageChange)

  return (
    <div className="p-8">

      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">
          Здравствуйте, Имя Пользователя!
        </h1>
        <p className="text-gray-500 mt-1">
          Вы делаете важную работу. Каждый разговор — это шаг к более сильной команде.
        </p>
      </div>

      {/* Статистика — 3 карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* Карточка 1 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Пройдено сценариев</span>
          </div>
          <p className="text-3xl font-bold text-[#1a1a1a]">{stats.completedScenarios}</p>
          <p className={`text-sm mt-1 ${stats.completedChange > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {stats.completedChange > 0 ? '↑ ' : ''}+{stats.completedChange} за последнюю неделю
          </p>
        </div>

        {/* Карточка 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Средний балл</span>
          </div>
          <p className="text-3xl font-bold text-[#1a1a1a]">{stats.averageScore}/10</p>
          <p className={`text-sm mt-1 ${avgChange.color}`}>{avgChange.text}</p>
        </div>

        {/* Карточка 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm text-gray-500">Слабые места</span>
          </div>
          <p className="text-3xl font-bold text-[#1a1a1a]">{stats.weakPoints}</p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.weakPointsAttention} требует внимания
          </p>
        </div>
      </div>

      {/* График + Последние попытки */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* График */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#1a1a1a]">Динамика оценок</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700">Неделя</button>
              <button className="px-3 py-1 text-sm rounded-lg text-gray-500 hover:bg-gray-50">Месяц</button>
            </div>
          </div>

          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Пройдите первый сценарий, чтобы увидеть график
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Последние попытки */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1a1a1a]">Последние попытки</h2>
            <a href="#" className="text-sm text-purple-600 hover:underline">Все попытки →</a>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 text-xs text-gray-400 pb-2 border-b">
              <span>Дата</span>
              <span>Сценарии</span>
              <span className="text-right">Оценка</span>
            </div>

            {recentAttempts.length === 0 && (
              <p className="text-sm text-gray-400">Пока нет попыток</p>
            )}

            {recentAttempts.map((item, index) => (
              <div key={index} className="grid grid-cols-3 items-center text-sm">
                <span className="text-gray-500">{item.date}</span>
                <span className="text-[#1a1a1a]">{item.scenario}</span>
                <div className="flex justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${scoreColor(item.score)}`}>
                    {item.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}