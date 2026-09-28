import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Calendar, Star, AlertTriangle } from 'lucide-react'
// ВСЁ ЗАХАРДКОЖЕНО
//БЕЗ УЧЁТА АПИ
//НАДО МЕНЯТЬ!!!!!
const chartData = [
  { date: '1 апр', score: 4 },
  { date: '8 апр', score: 6.5 },
  { date: '15 апр', score: 7.2 },
  { date: '22 апр', score: 8.5 },
  { date: '29 апр', score: 9.8 },
  { date: '6 мая', score: 10.2 },
  { date: '13 мая', score: 10.6 },
]

const recentAttempts = [
  { date: '12 апр 2025', scenario: 'Обратная связь', score: 7, color: 'bg-yellow-100 text-yellow-700' },
  { date: '8 апр 2025', scenario: 'Конфликт', score: 8, color: 'bg-green-100 text-green-700' },
  { date: '29 мар 2025', scenario: 'Демотивация', score: 6, color: 'bg-yellow-100 text-yellow-700' },
  { date: '5 мар 2025', scenario: 'Увольнение', score: 9, color: 'bg-green-100 text-green-700' },
]

export default function Progress() {
  return (
    <div className="p-8">

      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">
          Здравствуйте, Полина!
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
          <p className="text-3xl font-bold text-[#1a1a1a]">12</p>
          <p className="text-sm text-green-600 mt-1">↑ +3 за последнюю неделю</p>
        </div>

        {/* Карточка 2 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Средний балл</span>
          </div>
          <p className="text-3xl font-bold text-[#1a1a1a]">7.6/10</p>
          <p className="text-sm text-green-600 mt-1">↑ +0.4 за последнюю неделю</p>
        </div>

        {/* Карточка 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm text-gray-500">Слабые места</span>
          </div>
          <p className="text-3xl font-bold text-[#1a1a1a]">2</p>
          <p className="text-sm text-gray-500 mt-1">1 требует внимания</p>
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
                <YAxis domain={[0, 16]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
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

            {recentAttempts.map((item, index) => (
              <div key={index} className="grid grid-cols-3 items-center text-sm">
                <span className="text-gray-500">{item.date}</span>
                <span className="text-[#1a1a1a]">{item.scenario}</span>
                <div className="flex justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.color}`}>
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