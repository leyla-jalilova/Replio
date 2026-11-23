import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Check, AlertTriangle } from 'lucide-react'

// Результат приходит при переходе с диалога. Сохраняем его в браузере,
// чтобы он не пропадал при обновлении страницы.
function loadResult(id, fromState) {
  const key = `result-${id}`
  if (fromState) {
    localStorage.setItem(key, JSON.stringify(fromState))
    return fromState
  }
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function verdict(score) {
  if (score >= 8) return 'Отличный результат!'
  if (score >= 5) return 'Хороший результат!'
  return 'Есть над чем поработать'
}

// Цвет кольца по оценке
function ringColor(score) {
  if (score >= 8) return '#6ee7b7'
  if (score >= 5) return '#fcd34d'
  return '#fca5a5'
}

const RADIUS = 52
const LENGTH = 2 * Math.PI * RADIUS // длина окружности

export default function Review() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [result] = useState(() => loadResult(id, state?.result))

  if (!result) {
    return (
      <div className="p-8">
        <p className="text-gray-500 mb-4">Результат этого разговора недоступен.</p>
        <Link to="/scenarios" className="text-purple-700 hover:underline">
          К сценариям →
        </Link>
      </div>
    )
  }

  const { score, strengths = [], improvements = [], summary } = result

  return (
    <div className="p-6 md:p-8 max-w-3xl">

      <button
        onClick={() => navigate('/scenarios')}
        className="flex items-center gap-2 text-2xl font-semibold text-[#1a1a1a] mb-6"
      >
        <ChevronLeft className="w-6 h-6" />
        Разбор разговора
      </button>

      {/* Общая оценка */}
      <div className="bg-white rounded-3xl p-6 flex items-center gap-6 mb-5">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#f0f0f0" strokeWidth="12" />
            <circle
              cx="60" cy="60" r={RADIUS} fill="none"
              stroke={ringColor(score)} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${(score / 10) * LENGTH} ${LENGTH}`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#1a1a1a]">
            {score}/10
          </span>
        </div>
        <div>
          <p className="text-gray-500">Общая оценка:</p>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{verdict(score)}</h2>
          <p className="text-sm text-gray-600">{summary}</p>
        </div>
      </div>

      {/* Что сработало / что можно лучше */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-emerald-50 rounded-3xl p-6">
          <h3 className="flex items-center gap-2 font-semibold text-[#1a1a1a] mb-3">
            <Check className="w-5 h-5" /> Что сработало
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="bg-amber-50 rounded-3xl p-6">
          <h3 className="flex items-center gap-2 font-semibold text-[#1a1a1a] mb-3">
            <AlertTriangle className="w-5 h-5" /> Что можно лучше
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {improvements.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/scenarios"
          className="px-5 py-3 rounded-xl bg-[#cbc6dc] text-[#1a1a1a] font-medium hover:bg-[#bdb7d3] transition"
        >
          Новый сценарий
        </Link>
        <Link
          to="/progress"
          className="px-5 py-3 rounded-xl bg-white text-[#1a1a1a] font-medium hover:bg-gray-50 transition"
        >
          К прогрессу
        </Link>
      </div>
    </div>
  )
}