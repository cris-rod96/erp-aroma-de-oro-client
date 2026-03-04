import { Routes, Route, Navigate } from 'react-router-dom'
import { Cajas, Home, Login } from './pages/index.pages'
import RootLayout from './layout/RootLayout'
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio-sesion" replace />} />
      <Route path="/inicio-sesion" element={<Login />} />

      <Route path="/inicio" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/inicio/cajas" element={<Cajas />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
