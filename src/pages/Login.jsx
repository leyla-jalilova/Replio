import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import logo from '../assets/logo.png'
import authBg from '../assets/auth-bg.png'
import { loginUser } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Введите email и пароль')
      return
    }
    try {
      setLoading(true)
      setError('')
      await loginUser({ email, password })
      window.location.href = '/home'
    } catch (err) {
      setError(err.message || 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0d0d0d]">
      {/* Левая часть — фон */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={authBg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Правая часть — форма */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="Replio" className="h-16 w-auto" />
          </div>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">
            Sign in
          </h1>

          {/* Email */}
          <div className="mb-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[#e8e4f0] border-none outline-none text-[#1a1a1a] placeholder:text-gray-500 focus:ring-2 focus:ring-purple-300 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Your password"
                className="w-full pl-12 pr-12 py-3.5 rounded-full bg-[#e8e4f0] border-none outline-none text-[#1a1a1a] placeholder:text-gray-500 focus:ring-2 focus:ring-purple-300 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Ошибка */}
          <p className="text-red-500 text-sm pl-4 mb-4 min-h-5">{error}</p>

          {/* Кнопка */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#1a1a1a] text-white font-semibold text-lg hover:bg-[#333] transition mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Ссылка на регистрацию */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/" className="text-[#1a1a1a] font-semibold hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}