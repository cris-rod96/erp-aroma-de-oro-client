import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MENU_DATA } from '../../data'
import { MdLogout, MdChevronRight, MdRefresh, MdLock } from 'react-icons/md'
import { cajaAPI, empresaAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const Aside = ({ hiddenMenu }) => {
  // --- ESTADOS PARA EL LOGOUT ---
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.adminData)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const logout = useAuthStore((state) => state.logout)
  const clearCaja = useCajaStore((state) => state.clearCaja)
  const clearEmpresa = useEmpresaStore((state) => state.clearEmpresa)

  const navigate = useNavigate()

  const setCaja = useCajaStore((state) => state.setCaja)
  const setEmpresa = useEmpresaStore((state) => state.setEmpresa)

  // Validación inicial de requisitos
  useEffect(() => {
    let isMounted = true
    const verificarRequisitos = async () => {
      try {
        const [respCaja, respEmp] = await Promise.all([
          cajaAPI.obtenerCajaAbierta(token, user?.id),
          empresaAPI.obtenerInformacion(token),
        ])
        if (!isMounted) return
        if (respCaja.data?.caja) setCaja(respCaja.data.caja)
        if (respEmp.data?.empresa) setEmpresa(respEmp.data.empresa)
      } catch (error) {
        console.error('Error en validación de requisitos:', error)
      }
    }
    if (token && user?.id) verificarRequisitos()
    return () => {
      isMounted = false
    }
  }, [token, user?.id, setCaja, setEmpresa])

  // Lógica de cuenta regresiva para Logout
  useEffect(() => {
    let timer
    if (isLoggingOut && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      logout()
      clearCaja()
      clearEmpresa()
      navigate('/inicio-sesion')
    }
    return () => clearInterval(timer)
  }, [isLoggingOut, countdown, logout, clearCaja, clearEmpresa, navigate])

  const handleLogoutClick = () => {
    setIsLoggingOut(true)
  }

  return (
    <>
      {/* LOADER DE CIERRE DE SESIÓN */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <MdRefresh className="text-amber-500 animate-spin" size={80} />
            <span className="absolute text-2xl font-black text-white">{countdown}</span>
          </div>
          <h2 className="mt-6 text-white font-black uppercase tracking-[0.3em] text-sm italic">
            Cerrando Sesión Segura
          </h2>
        </div>
      )}

      <aside
        className={`fixed h-screen w-80 flex flex-col z-50 transition-all duration-500 shadow-2xl overflow-hidden ${
          !hiddenMenu ? 'left-0' : '-left-full'
        }`}
      >
        <div className="absolute inset-0 z-[-1]">
          <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/80 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
        </div>

        {/* PERFIL */}
        <section className="p-8 flex flex-col gap-4 items-center border-b border-white/10 backdrop-blur-md">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full border-4 ${isAdmin ? 'border-amber-500/50' : 'border-emerald-500/50'} p-1`}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.nombresCompletos || 'Admin'}&background=${isAdmin ? 'fbbf24' : '10b981'}&color=000&bold=true`}
                className="w-full h-full rounded-full object-cover bg-amber-500"
                alt="Profile"
              />
            </div>
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 ${isAdmin ? 'bg-emerald-500' : 'bg-amber-500'} border-4 border-[#1a2529] rounded-full`}
            ></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {user?.nombresCompletos || 'Usuario'}
            </h3>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isAdmin ? 'text-amber-500' : 'text-emerald-500'}`}
            >
              {isAdmin ? 'Administrador' : 'Contabilidad'}
            </p>
          </div>
        </section>

        {/* MENÚ CON INHABILITACIÓN VISUAL MEJORADA */}
        <section className="flex flex-col overflow-y-auto flex-1 py-4 custom-scrollbar">
          {MENU_DATA.map((item, index) => {
            const isBlocked = item.onlyAdmin && !isAdmin

            return (
              <NavLink
                end
                key={index}
                to={isBlocked ? '#' : item.path}
                onClick={(e) => isBlocked && e.preventDefault()}
                className={({ isActive }) =>
                  `relative px-8 py-5 flex flex-row items-center justify-between w-full transition-all duration-300 ${
                    isBlocked
                      ? 'cursor-not-allowed'
                      : isActive
                        ? 'bg-amber-500/10 border-r-4 border-amber-500 text-amber-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div
                  className={`flex items-center gap-4 transition-colors ${isBlocked ? 'text-white/40' : ''}`}
                >
                  <item.icon size={24} className={`${isBlocked ? 'text-amber-900/40' : ''}`} />
                  <span
                    className={`text-sm font-black uppercase italic tracking-tight ${isBlocked ? 'text-white/30' : ''}`}
                  >
                    {item.label}
                  </span>
                </div>

                {isBlocked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-black text-rose-500/60 uppercase tracking-tighter">
                      Bloqueado
                    </span>
                    <MdLock size={18} className="text-rose-500/40" />
                  </div>
                ) : (
                  <MdChevronRight size={20} className="opacity-50" />
                )}
              </NavLink>
            )
          })}

          {/* MENSAJE DE RESTRICCIÓN AL FINAL */}
          {!isAdmin && (
            <div className="px-8 py-4 mt-auto">
              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                <MdLock size={18} />
                <span className="text-[9px] font-black uppercase tracking-tighter leading-tight">
                  Acceso restringido: Solo reportes habilitados
                </span>
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <div className="p-6 bg-black/60 border-t border-white/10">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-3 py-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded-lg transition-all font-black uppercase text-xs tracking-widest"
          >
            <MdLogout size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export default Aside
