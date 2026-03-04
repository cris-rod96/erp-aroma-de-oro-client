import { Routes, Route, Navigate } from 'react-router-dom'
import {
  Cajas,
  Compras,
  Configuracion,
  CuentasPorCobrar,
  CuentasPorPagar,
  Empresa,
  Home,
  Inventario,
  Kardex,
  Login,
  Nomina,
  Productores,
  Reportes,
  Usuarios,
  Ventas,
} from './pages/index.pages'
import RootLayout from './layout/RootLayout'
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio-sesion" replace />} />
      <Route path="/inicio-sesion" element={<Login />} />

      <Route path="/inicio" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/inicio/cajas" element={<Cajas />} />
        <Route path="/inicio/productores" element={<Productores />} />

        <Route path="/inicio/compras" element={<Compras />} />
        <Route path="/inicio/configuracion" element={<Configuracion />} />
        <Route path="/inicio/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
        <Route path="/inicio/cuentas-por-pagar" element={<CuentasPorPagar />} />
        <Route path="/inicio/empresa" element={<Empresa />} />
        <Route path="/inicio/inventario" element={<Inventario />} />
        <Route path="/inicio/kardex" element={<Kardex />} />
        <Route path="/inicio/nomina" element={<Nomina />} />
        <Route path="/inicio/reportes" element={<Reportes />} />
        <Route path="/inicio/usuarios" element={<Usuarios />} />
        <Route path="/inicio/ventas" element={<Ventas />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
