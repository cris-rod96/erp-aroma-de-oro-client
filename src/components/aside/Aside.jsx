import { useEffect, useState } from 'react' // Añadimos useState
import { NavLink, useNavigate } from 'react-router-dom'
import { MENU_DATA } from '../../data'
import { MdLogout, MdChevronRight, MdLock, MdRefresh } from 'react-icons/md' // Añadimos MdRefresh para el loader
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
  const logout = useAuthStore((state) => state.logout)
  const clearCaja = useCajaStore((state) => state.clearCaja)
  const clearEmpresa = useEmpresaStore((state) => state.clearEmpresa)

  const navigate = useNavigate()

  const setCaja = useCajaStore((state) => state.setCaja)
  const cerrarCajaStore = useCajaStore((state) => state.cerrarCaja)
  const isCajaAbierta = useCajaStore((state) => state.isCajaAbierta)

  const empresa = useEmpresaStore((state) => state.empresa)
  const setEmpresa = useEmpresaStore((state) => state.setEmpresa)

  // Efecto para la validación inicial
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
        else cerrarCajaStore()
        if (respEmp.data?.empresa) setEmpresa(respEmp.data.empresa)
      } catch (error) {
        console.error('Error en validación de requisitos:', error)
      }
    }
    if (token && user?.id) verificarRequisitos()
    return () => {
      isMounted = false
    }
  }, [token, user?.id, setCaja, setEmpresa, cerrarCajaStore])

  // --- LÓGICA DE LA CUENTA REGRESIVA ---
  useEffect(() => {
    let timer
    if (isLoggingOut && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      // Cuando llega a cero, ejecutamos el logout real
      logout()
      clearCaja()
      clearEmpresa()
      navigate('/inicio-sesion')
    }
    return () => clearInterval(timer)
  }, [isLoggingOut, countdown, logout, clearCaja, clearEmpresa, navigate])

  const isItemDisabled = (label) => {
    const ruta = label.toLowerCase()
    const modulosCriticos = ['compras', 'ventas', 'caja', 'arqueos', 'egresos', 'gastos']
    if (modulosCriticos.includes(ruta)) {
      if (!empresa) return true
      if (ruta !== 'caja' && !isCajaAbierta) return true
    }
    return false
  }

  const handleLogoutClick = () => {
    setIsLoggingOut(true)
  }

  return (
    <>
      {/* LOADER DE CIERRE DE SESIÓN (OVERLAY) */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center">
            <MdRefresh className="text-amber-500 animate-spin" size={80} />
            <span className="absolute text-2xl font-black text-white">{countdown}</span>
          </div>
          <h2 className="mt-6 text-white font-black uppercase tracking-[0.3em] text-sm italic">
            Cerrando Sesión Segura
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-widest">
            Limpiando datos de acceso en {countdown}s...
          </p>

          <button
            onClick={() => setIsLoggingOut(false)}
            className="mt-10 text-gray-500 hover:text-white text-[9px] font-black uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full transition-all"
          >
            Cancelar
          </button>
        </div>
      )}

      <aside
        className={`fixed h-screen w-80 flex flex-col z-50 transition-all duration-500 ease-in-out shadow-2xl overflow-hidden ${
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
            <div className="w-24 h-24 rounded-full border-4 border-amber-500/50 p-1">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.nombresCompletos || 'Admin'}&background=fbbf24&color=000&bold=true`}
                className="w-full h-full rounded-full object-cover bg-amber-500"
                alt="Profile"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-[#1a2529] rounded-full"></div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {user?.nombresCompletos || 'Usuario'}
            </h3>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">
              {user?.rol || 'Administrador'}
            </p>
          </div>
        </section>

        {/* MENÚ */}
        <section className="flex flex-col overflow-y-auto flex-1 py-4 custom-scrollbar">
          {MENU_DATA.map((item, index) => {
            const disabled = isItemDisabled(item.label)
            return (
              <NavLink
                end
                key={index}
                to={disabled ? '#' : item.path}
                onClick={(e) => disabled && e.preventDefault()}
                className={({ isActive }) =>
                  `relative px-8 py-5 flex flex-row items-center justify-between w-full transition-all duration-300 ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed bg-black/40'
                      : isActive
                        ? 'bg-amber-500/10 border-r-4 border-amber-500 text-amber-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-4">
                  <item.icon size={24} className={disabled ? 'text-gray-600' : ''} />
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-black uppercase italic tracking-tight ${disabled ? 'text-gray-600' : ''}`}
                    >
                      {item.label}
                    </span>
                    {disabled && (
                      <div className="flex items-center gap-1 mt-1 bg-amber-500 px-2 py-0.5 rounded-sm w-fit">
                        <MdLock size={10} className="text-black" />
                        <span className="text-[9px] font-black text-black uppercase leading-none">
                          {!empresa ? 'FALTA INFO EMPRESA' : 'REQUIERE ABRIR CAJA'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!disabled && <MdChevronRight size={20} className="opacity-50" />}
              </NavLink>
            )
          })}
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
