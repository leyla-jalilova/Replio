import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Progress from './pages/Progress'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Страница без сайдбара */}
        <Route path="/" element={<Register />} />

        {/* Страницы с сайдбаром */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App