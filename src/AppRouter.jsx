import { Routes, Route, Navigate, replace } from 'react-router-dom'
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
  NotFound,
  Tickets,
  Anticipos,
  Prestamos,
  Gastos,
} from './pages/index.pages'
import RootLayout from './layout/RootLayout'
import { useAuthStore } from './store/useAuthStore'
const AppRouter = () => {
  const token = useAuthStore((state) => state.token)
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio-sesion" replace />} />
      <Route
        path="/inicio-sesion"
        element={token ? <Navigate to="/inicio" replace /> : <Login />}
      />

      <Route
        path="/inicio"
        element={token ? <RootLayout /> : <Navigate to="/inicio-sesion" replace />}
      >
        <Route index element={<Home />} />
        <Route path="/inicio/cajas" element={<Cajas />} />
        <Route path="/inicio/productores" element={<Productores />} />
        <Route path="/inicio/tickets" element={<Tickets />} />
        <Route path="/inicio/compras" element={<Compras />} />
        <Route path="/inicio/configuracion" element={<Configuracion />} />
        <Route path="/inicio/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
        <Route path="/inicio/cuentas-por-pagar" element={<CuentasPorPagar />} />
        <Route path="/inicio/inventario" element={<Inventario />} />
        <Route path="/inicio/kardex" element={<Kardex />} />
        <Route path="/inicio/nomina" element={<Nomina />} />
        <Route path="/inicio/reportes" element={<Reportes />} />
        <Route path="/inicio/usuarios" element={<Usuarios />} />
        <Route path="/inicio/ventas" element={<Ventas />} />
        <Route path="/inicio/anticipos" element={<Anticipos />} />
        <Route path="/inicio/prestamos" element={<Prestamos />} />
        <Route path="/inicio/gastos" element={<Gastos />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
