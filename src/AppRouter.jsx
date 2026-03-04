import { Routes, Route, Navigate } from 'react-router-dom'
import { Home, Login } from './pages/index.pages'
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio-sesion" replace />} />
      <Route path="/inicio-sesion" element={<Login />} />

      <Route path="/inicio" element={<Home />} />
    </Routes>
  )
}

export default AppRouter
