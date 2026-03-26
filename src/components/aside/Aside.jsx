import { useEffect, useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MENU_DATA } from '../../data'
import { MdLogout, MdChevronRight, MdRefresh, MdLock } from 'react-icons/md'
import { cajaAPI, empresaAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const Aside = ({ hiddenMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // 1. Uso correcto del Store simplificado (user en lugar de data)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  // 2. Lógica derivada: No necesitamos 'estaHabilitado' en el store.
  // Lo calculamos aquí para evitar estados duplicados o antiguos.
  const tienePermisosEspeciales = useMemo(() => {
    return user?.rol === 'Administrador' || user?.rol === 'Contador'
  }, [user?.rol])

  const clearCaja = useCajaStore((state) => state.clearCaja)
  const clearEmpresa = useEmpresaStore((state) => state.clearEmpresa)
  const setCaja = useCajaStore((state) => state.setCaja)
  const setEmpresa = useEmpresaStore((state) => state.setEmpresa)

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const verificarRequisitos = async () => {
      try {
        // Usamos el ID del usuario desde la nueva estructura 'user'
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

  useEffect(() => {
    let timer
    if (isLoggingOut && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000)
    } else if (countdown === 0) {
      logout()
      clearCaja()
      clearEmpresa()
      navigate('/inicio-sesion')
    }
    return () => clearInterval(timer)
  }, [isLoggingOut, countdown, logout, clearCaja, clearEmpresa, navigate])

  return (
    <>
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
        className={`fixed h-screen w-80 flex flex-col z-40 transition-all duration-500 shadow-2xl overflow-hidden ${
          !hiddenMenu ? 'left-0' : '-left-full'
        }`}
      >
        <div className="absolute inset-0 z-[-1]">
          <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/85 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
        </div>

        {/* PERFIL DINÁMICO */}
        <section className="p-8 flex flex-col gap-4 items-center border-b border-white/10 backdrop-blur-md">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full border-4 ${tienePermisosEspeciales ? 'border-amber-500/50' : 'border-emerald-500/50'} p-1`}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.nombresCompletos || 'User'}&background=${tienePermisosEspeciales ? 'fbbf24' : '10b981'}&color=000&bold=true`}
                className="w-full h-full rounded-full object-cover bg-amber-500"
                alt="Profile"
              />
            </div>
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 ${tienePermisosEspeciales ? 'bg-amber-500' : 'bg-emerald-500'} border-4 border-[#1a2529] rounded-full`}
            ></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {user?.nombresCompletos || 'Cargando...'}
            </h3>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.3em] ${tienePermisosEspeciales ? 'text-amber-500' : 'text-emerald-500'}`}
            >
              {user?.rol || 'Personal'}
            </p>
          </div>
        </section>

        {/* MENÚ FILTRADO */}
        <section className="flex flex-col overflow-y-auto flex-1 py-4 custom-scrollbar">
          {MENU_DATA.map((item, index) => {
            // Bloqueo dinámico basado en el rol actual
            const isBlocked = item.onlyAdmin && !tienePermisosEspeciales

            return (
              <NavLink
                end
                key={index}
                to={isBlocked ? '#' : item.path}
                onClick={(e) => isBlocked && e.preventDefault()}
                className={({ isActive }) =>
                  `relative px-8 py-5 flex flex-row items-center justify-between w-full transition-all duration-300 ${
                    isBlocked
                      ? 'opacity-40 cursor-not-allowed grayscale'
                      : isActive
                        ? 'bg-amber-500/10 border-r-4 border-amber-500 text-amber-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-4 transition-colors">
                  <item.icon size={24} />
                  <span className="text-sm font-black uppercase italic tracking-tight">
                    {item.label}
                  </span>
                </div>

                {isBlocked ? (
                  <MdLock size={18} className="text-rose-500/60" />
                ) : (
                  <MdChevronRight size={20} className="opacity-30" />
                )}
              </NavLink>
            )
          })}

          {/* AVISO DE RESTRICCIÓN */}
          {!tienePermisosEspeciales && (
            <div className="px-8 py-4 mt-auto">
              <div className="flex items-center gap-3 text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                <MdLock size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest leading-tight">
                  Modo Lectura: <br /> Acceso a Gestión Restringido
                </span>
              </div>
            </div>
          )}
        </section>

        <div className="p-6 bg-black/40 border-t border-white/10">
          <button
            onClick={() => setIsLoggingOut(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <MdLogout size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>
    </>
  )
}

export default Aside
