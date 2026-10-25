import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, Users } from 'lucide-react'
import { getScenarios, startChat } from '../api/scenarios'
import { getProgressData } from '../api/progress'

const BUTTON =
  'w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#cbc6dc] text-[#1a1a1a] font-medium hover:bg-[#bdb7d3] transition disabled:opacity-50 disabled:cursor-not-allowed'

export default function Scenarios() {
  const navigate = useNavigate()

  const [scenarios, setScenarios] = useState([])
  const [weakTitles, setWeakTitles] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getScenarios()
      .then((list) => setScenarios(list || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    // Слабые места необязательны: если не загрузились, блок просто будет пустым
    getProgressData()
      .then((data) => setWeakTitles(data?.weakScenarios || []))
      .catch(() => {})
  }, [])

  // Создаём разговор и переходим на страницу диалога
  const start = async (scenarioId) => {
    try {
      setStarting(true)
      setError('')
      const session = await startChat(scenarioId)
      if (session) navigate(`/chat/${session.session_id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  const startRandom = () => {
    if (scenarios.length === 0) return
    const random = scenarios[Math.floor(Math.random() * scenarios.length)]
    start(random.id)
  }

  // Слабые места приходят как названия, находим по ним полные сценарии
  const weakScenarios = scenarios.filter((s) => weakTitles.includes(s.title))

  if (loading) return <div className="p-8 text-gray-500">Загрузка...</div>

  return (
      <div className="relative min-h-full py-10 px-6 flex justify-center overflow-hidden">

            {/* Левый узор */}
            <div className="hidden lg:block absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

            {/* Правый узор */}
            <div className="hidden lg:block absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

    <div className="w-full max-w-2xl space-y-6 relative z-10">

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Фильтры */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="font-semibold text-lg text-[#1a1a1a] mb-5">Фильтры сценариев</h2>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-semibold text-[#1a1a1a] pb-3 border-b border-gray-300">
            <span>Сценарии</span>
            <span className="text-right">Сложность</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Выбор сценария */}
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none bg-[#f0f0f0] rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Выберите сценарий</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>

            {/* Сложность: пока заглушка, на бэкенде такого поля нет */}
            <div className="relative">
              <select
                disabled
                className="w-full appearance-none bg-[#f0f0f0] rounded-xl px-4 py-3 pr-10 text-sm text-gray-400 outline-none cursor-not-allowed"
              >
                <option>Скоро</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => start(Number(selectedId))}
            disabled={!selectedId || starting}
            className={BUTTON}
          >
            <span>{starting ? 'Запускаем...' : 'Начать сценарий'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Описание выбранного сценария */}
          {selectedId && (
            <p className="text-sm text-gray-500 mt-4">
              {scenarios.find((s) => s.id === Number(selectedId))?.description}
            </p>
          )}
        </div>

        {/* Сценарии, требующие внимания */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="font-semibold text-lg text-[#1a1a1a] mb-5">
            Сценарии, требующие внимания
          </h2>

          {weakScenarios.length === 0 ? (
            <p className="text-sm text-gray-400">
              Пока таких нет. Пройдите несколько сценариев, и мы покажем, что стоит подтянуть.
            </p>
          ) : (
            <div className="space-y-4">
              {weakScenarios.map((s) => (
                <div key={s.id} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-[#1a1a1a]">{s.title}</h3>
                    <button
                      onClick={() => start(s.id)}
                      disabled={starting}
                      className="text-sm text-purple-700 hover:underline disabled:opacity-50"
                    >
                      Пройти снова →
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Случайный сценарий */}
        <div className="bg-white rounded-3xl p-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg text-[#1a1a1a] mb-1">Случайный сценарий</h3>
          <p className="text-sm text-gray-500 mb-5">
            Мгновенно начните непредсказуемый диалог
          </p>
          <button
            onClick={startRandom}
            disabled={scenarios.length === 0 || starting}
            className={BUTTON}
          >
            <span>{starting ? 'Запускаем...' : 'Начать сценарий'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  )
}