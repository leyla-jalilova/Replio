import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import logo from '../assets/logo.png'
import authBg from '../assets/auth-bg.png'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen w-full flex bg-[#0d0d0d]">

      {/* Левая часть — фон из дизайна */}
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

          {/* Логотип */}
          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="Replio" className="h-15 w-auto" />
          </div>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">
            Create an account
          </h1>

          {/* Email */}
          <div className="mb-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Your email"
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[#e8e4f0] border-none outline-none text-[#1a1a1a] placeholder:text-gray-500 focus:ring-2 focus:ring-purple-300 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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

          {/* Кнопка */}
          <button
            onClick={() => window.location.href = '/home'}
            className="w-full py-3.5 rounded-full bg-[#1a1a1a] text-white font-semibold text-lg hover:bg-[#333] transition mb-8"
          >
            Create account
          </button>

          {/* Разделитель */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Соц. кнопки */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="w-12 h-12 rounded-full bg-[#e8e4f0] flex items-center justify-center hover:bg-[#d9d3e8] transition font-semibold text-lg text-[#1a1a1a]">
              G
            </button>
            <button className="w-12 h-12 rounded-full bg-[#e8e4f0] flex items-center justify-center hover:bg-[#d9d3e8] transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.9 2.93 12.27 4.7 9.39C5.57 7.95 7.13 7.08 8.82 7.05C10.1 7.02 11.32 7.9 12.11 7.9C12.89 7.9 14.37 6.84 15.92 7.01C16.57 7.04 18.39 7.28 19.56 9.07C19.47 9.13 17.39 10.4 17.41 12.91C17.44 15.91 19.93 16.91 19.96 16.92C19.93 17.03 19.55 18.26 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-[#e8e4f0] flex items-center justify-center hover:bg-[#d9d3e8] transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
          </div>

          {/* Ссылка внизу */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <a href="#" className="text-[#1a1a1a] font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}