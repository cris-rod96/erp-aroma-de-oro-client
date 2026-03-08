import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoute = ({ isAllowed, redirectTo = '/login', children }) => {
  // Si no está permitido (no hay token o no es admin), redirigimos
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />
  }

  // Si todo está bien, renderizamos el contenido (Outlet o children)
  return children ? children : <Outlet />
}
