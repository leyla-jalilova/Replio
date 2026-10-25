import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Progress from './pages/Progress'
import ComingSoon from './pages/ComingSoon'
import Scenarios from './pages/Scenarios'
import Dialoque from './pages/Dialoque'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Страницы без сайдбара */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Страницы с сайдбаром */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/chat/:id" element={<Dialoque />} />
          <Route path="/chat/:id/review" element={<ComingSoon />} />
          <Route path="/recommendations" element={<ComingSoon />} />
          <Route path="/library" element={<ComingSoon />} />
          <Route path="/settings" element={<ComingSoon />} />
          {/* Любой другой адрес */}
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App