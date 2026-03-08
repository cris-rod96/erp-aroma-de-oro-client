import { Routes, Route, Navigate } from 'react-router-dom'
import {
  Cajas,
  Compras,
  Configuracion,
  CuentasPorCobrar,
  CuentasPorPagar,
  Home,
  Inventario,
  Kardex,
  Login,
  Nomina,
  Productores,
  Reportes,
  Usuarios,
  Ventas,
  Alerta,
  NotFound,
  NotAuthorized,
} from './pages/index.pages'

import RootLayout from './layout/RootLayout'
import { useAuthStore } from './store/useAuthStore'
import { ProtectedRoute } from './components/protected/ProtectedRoute'

const AppRouter = () => {
  const token = useAuthStore((state) => state.token)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  return (
    <Routes>
      {/* 1. LOGIN */}
      <Route
        path="/inicio-sesion"
        element={!token ? <Login /> : <Navigate to="/inicio" replace />}
      />

      {/* 2. PROTECCIÓN DE SESIÓN (NIVEL 1) */}
      <Route
        element={
          token ? <RootLayout /> : <NotAuthorized /> // SI NO HAY TOKEN, MUESTRO LA 401 EN LUGAR DE MANDAR AL LOGIN
        }
      >
        <Route path="/inicio">
          <Route index element={<Home />} />
          <Route path="cajas" element={<Cajas />} />
          <Route path="productores" element={<Productores />} />
          <Route path="compras" element={<Compras />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="cuentas-por-cobrar" element={<CuentasPorCobrar />} />
          <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="kardex" element={<Kardex />} />
          <Route path="nomina" element={<Nomina />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="alertas" element={<Alerta />} />

          {/* 3. PROTECCIÓN DE ADMIN (NIVEL 2) */}
          <Route
            path="usuarios"
            element={
              isAdmin ? <Usuarios /> : <NotAuthorized /> // SI NO ES ADMIN, MUESTRO LA 401
            }
          />
        </Route>
      </Route>

      {/* RUTA RAIZ */}
      <Route
        path="/"
        element={
          token ? <Navigate to="/inicio" replace /> : <Navigate to="/inicio-sesion" replace />
        }
      />

      {/* 404 GENERAL */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
