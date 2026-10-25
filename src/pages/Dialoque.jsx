import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Clock, ArrowRight, Send } from 'lucide-react'
import { getChat, sendMessage, finishChat } from '../api/chat'
import { getScenarios } from '../api/scenarios'

function formatTimer(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function nowTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export default function Dialoque() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const bottomRef = useRef(null)

  // Загружаем разговор (если страницу обновили, переписка вернётся)
  useEffect(() => {
    getChat(id)
      .then((chat) => {
        if (!chat) return
        setTitle(chat.scenario)
        setMessages(chat.messages)

        // Описание сценария берём из общего списка по названию
        getScenarios()
          .then((list) => {
            const found = list?.find((s) => s.title === chat.scenario)
            if (found) setDescription(found.description)
          })
          .catch(() => {})
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // Таймер разговора
  useEffect(() => {
    if (finishing) return
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [finishing])

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async () => {
    const content = text.trim()
    if (!content || sending || finishing) return

    setText('')
    setError('')
    setSending(true)
    // Сразу показываем сообщение пользователя, не дожидаясь ответа ИИ
    setMessages((prev) => [...prev, { role: 'user', content, time: nowTime() }])

    try {
      const res = await sendMessage(id, content)
      if (res) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.answer, time: nowTime() },
        ])
      }
    } catch (e) {
      // Сервер сообщение не сохранил: убираем его и возвращаем текст в поле
      setMessages((prev) => prev.slice(0, -1))
      setText(content)
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  const handleFinish = async () => {
    if (messages.length === 0) {
      setError('Сначала напишите хотя бы одно сообщение')
      return
    }
    try {
      setFinishing(true)
      setError('')
      const result = await finishChat(id)
      if (result) navigate(`/chat/${id}/review`, { state: { result } })
    } catch (e) {
      setError(e.message)
      setFinishing(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Загрузка...</div>

  return (
    <div className="h-screen flex gap-5 p-5">

      {/* Левая часть: чат */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Шапка */}
        <div className="bg-white rounded-3xl px-6 py-4 flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/scenarios')}
            className="flex items-center gap-3 text-xl font-semibold text-[#1a1a1a]"
          >
            <ChevronLeft className="w-5 h-5" />
            {title}
          </button>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1a1a1a]" />
            <div className="text-right leading-tight">
              <p className="text-xl font-semibold text-[#1a1a1a]">{formatTimer(seconds)}</p>
              <p className="text-xs text-gray-500">время разговора</p>
            </div>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 mt-10">
              Начните разговор: напишите первое сообщение сотруднику
            </p>
          )}

          {messages.map((m, i) => {
            const mine = m.role === 'user'
            return (
              <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 text-[#1a1a1a] ${
                    mine ? 'bg-[#c1bdd3]' : 'bg-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.time && (
                    <p className="text-xs text-gray-600 text-right mt-1">{m.time}</p>
                  )}
                </div>
              </div>
            )
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-5 py-3 text-gray-400 text-sm">
                Сотрудник печатает...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Ошибка */}
        {error && <p className="text-red-500 text-sm mt-2 px-2">{error}</p>}

        {/* Ввод */}
        <div className="bg-white rounded-3xl p-3 pl-6 mt-4 flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={finishing}
            placeholder="Напишите сообщение..."
            className="flex-1 outline-none text-[#1a1a1a] placeholder:text-purple-400 bg-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || finishing}
            className="w-12 h-12 rounded-xl bg-[#cbc6dc] flex items-center justify-center hover:bg-[#bdb7d3] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-purple-800" />
          </button>
        </div>
      </div>

      {/* Правая панель */}
      <aside className="w-80 bg-white rounded-3xl p-5 hidden lg:block overflow-y-auto">
        <button
          onClick={handleFinish}
          disabled={finishing || sending}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#cbc6dc] text-[#1a1a1a] font-medium hover:bg-[#bdb7d3] transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{finishing ? 'Оцениваем...' : 'Завершить разговор'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-lg text-[#1a1a1a]">Сценарий</p>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </aside>
    </div>
  )
}