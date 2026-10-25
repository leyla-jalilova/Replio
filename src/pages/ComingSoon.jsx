import { Hammer } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
        <Hammer className="w-7 h-7 text-purple-600" />
      </div>
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Страница в разработке</h1>
      <p className="text-gray-500">Скоро здесь появится новый раздел Replio.</p>
    </div>
  )
}