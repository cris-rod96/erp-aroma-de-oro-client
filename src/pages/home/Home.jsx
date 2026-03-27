import { useState, useEffect } from 'react'
import { ITEMS_DATA } from '../../data'
import { NavLink, useOutletContext } from 'react-router-dom'
import {
  MdTrendingUp,
  MdLock,
  MdSecurity,
  MdWarning,
  MdErrorOutline,
  MdArrowForward,
} from 'react-icons/md'
import { Container, Loading } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  cajaAPI,
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  empresaAPI,
  liquidacionAPI,
  productorAPI,
  trabajadorAPI,
  usuarioAPI,
  ventaAPI,
} from '../../api/index.api'

const Home = () => {
  const { hiddenMenu } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensajeLoading, setMensajeLoading] = useState('Iniciando sistema...')

  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [empresaRegistrada, setEmpresaRegistrada] = useState(true)

  const token = useAuthStore((store) => store.token)
  const user = useAuthStore((state) => state.user)
  const estaHabilitado = user?.rol === 'Administrador' || user?.rol === 'Contador'

  const [stats, setStats] = useState({
    USUARIOS: 'Cargando...',
    NÓMINA: '0 Empleados',
    COMPRAS: '0 Hoy',
    INVENTARIO: '0.00 qq',
    PRODUCTORES: '0 Total',
    CAJAS: '$0.00',
    KARDEX: 'Ver mov.',
    VENTAS: '$0. 00',
    REPORTES: 'PDF/Excel',
    'POR COBRAR': '$0. 00',
    'POR PAGAR': '$0. 00',
    CONFIGURACIÓN: 'Ajustes',
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        setMensajeLoading('Sincronizando base de datos...')

        const [
          respUsuarios,
          respProductores,
          respTrabajadores,
          respLiquidaciones,
          respCajaActiva,
          respVentas,
          respCuentasPorPagar,
          respCuentasPorCobrar,
          respEmpresa,
        ] = await Promise.all([
          usuarioAPI.listarUsuarios(token),
          productorAPI.listarTodos(token),
          trabajadorAPI.listarTodos(token),
          liquidacionAPI.listarTodas(token),
          cajaAPI.obtenerCajaAbierta(token, user?.id),
          ventaAPI.listarVentas(token),
          cuentasPorPagarAPI.listarPendientes(token),
          cuentasPorCobrarAPI.listarPendientes(token),
          empresaAPI.obtenerInformacion(token),
        ])

        const cajaData = respCajaActiva.data.caja
        setCajaAbierta(!!cajaData)
        setEmpresaRegistrada(respEmpresa.data.empresa)

        const usuariosData = respUsuarios.data.usuarios || []
        const countActivos = usuariosData.filter((u) => u.estaActivo).length
        const hoy = new Date().toISOString().split('T')[0]
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

        const liquidacionesHoy = (respLiquidaciones.data.liquidaciones || []).filter((liq) => {
          const fechaLiq = liq.createdAt || liq.fecha
          return new Date(fechaLiq).toISOString().split('T')[0] === hoy
        }).length

        const dineroEnCaja = cajaData ? parseFloat(cajaData.saldoActual || 0) : 0

        let totalVentasHoy = 0
        ;(respVentas.data.ventas || []).forEach((v) => {
          if (new Date(v.createdAt).toISOString().split('T')[0] === hoy)
            totalVentasHoy += parseFloat(v.totalFactura || 0)
        })

        const totalPorPagar = (respCuentasPorPagar.data.cuentasPorPagar || []).reduce(
          (acc, c) => acc + parseFloat(c.saldoPendiente || 0),
          0
        )
        const totalPorCobrar = (respCuentasPorCobrar.data.cuentasPorCobrar || []).reduce(
          (acc, c) => acc + parseFloat(c.montoPorCobrar || 0),
          0
        )

        setStats((prev) => ({
          ...prev,
          USUARIOS: `${countActivos} Activos`,
          NÓMINA: `${respTrabajadores.data.trabajadores?.length || 0} Empleados`,
          COMPRAS: `${liquidacionesHoy} Hoy`,
          INVENTARIO: `Ver bodega`,
          PRODUCTORES: `${respProductores.data.productores?.length || 0} Total`,
          CAJAS: formatter.format(dineroEnCaja),
          VENTAS: formatter.format(totalVentasHoy),
          'POR COBRAR': formatter.format(totalPorCobrar),
          'POR PAGAR': formatter.format(totalPorPagar),
        }))
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al obtener información'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    if (token && user?.id) fetchDashboardData()
  }, [token, user?.id])

  // COMPONENTE DE BANNER INTEGRADO
  const BannerInformativo = () => {
    if (cajaAbierta && empresaRegistrada) return null

    return (
      <div className="w-full mb-12 mt-4">
        {' '}
        {/* Añadido mt-4 para alejarlo del borde superior */}
        <div className="bg-white border border-amber-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-[14px] border-l-amber-400">
          <div className="flex items-center gap-6">
            <div className="bg-amber-50 p-5 rounded-3xl text-amber-500 shadow-inner">
              <MdWarning size={35} />
            </div>
            <div>
              <h2 className="text-[#375A65] font-black text-sm uppercase tracking-[0.15em] italic">
                Acción Requerida
              </h2>
              <div className="flex flex-col gap-1.5 mt-2">
                {!cajaAbierta && (
                  <p className="text-gray-500 text-[11px] font-bold uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    No se detecta una caja abierta para su usuario.
                  </p>
                )}
                {!empresaRegistrada && (
                  <p className="text-gray-500 text-[11px] font-bold uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    La información de la empresa no está registrada.
                  </p>
                )}
              </div>
            </div>
          </div>
          <NavLink
            to={!cajaAbierta ? '/inicio/cajas' : '/inicio/configuracion'}
            className="flex items-center gap-3 bg-[#375A65] hover:bg-[#2a454e] text-white text-[10px] font-black py-4 px-10 rounded-[1.5rem] transition-all duration-300 uppercase tracking-widest group shadow-xl shadow-gray-200"
          >
            Configurar ahora
            <MdArrowForward size={18} className="group-hover:translate-x-2 transition-transform" />
          </NavLink>
        </div>
      </div>
    )
  }

  return (
    <>
      {loading && <Loading mensaje={mensajeLoading} />}

      {error ? (
        <Container fullWidth={true}>
          <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-2xl ">
            <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
              <MdSecurity size={50} className="text-rose-400" />
            </div>
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto leading-relaxed">
              {error}
            </p>
            <span className="text-[8px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full mt-4 font-black uppercase italic">
              Seguridad Aroma de Oro
            </span>
          </div>
        </Container>
      ) : (
        <section
          className={`flex-1 bg-[#F5F9FF] min-h-screen transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'} `}
        >
          {/* AJUSTE: py-32 le da espacio suficiente arriba (header) y abajo */}
          <div
            className={`flex flex-col ${
              hiddenMenu ? 'w-[90%]' : 'w-[80%] pl-56'
            } mx-auto py-32 px-10 transition-all duration-500`}
          >
            {!loading && <BannerInformativo />}

            <div
              className={`grid md:grid-cols-2 sm:grid-cols-1 items-center gap-10 ${
                hiddenMenu ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              }`}
            >
              {ITEMS_DATA.map((item, index) => {
                const isBlocked = item.onlyAdmin && !estaHabilitado
                const needsCaja = ['VENTAS', 'CAJAS', 'COMPRAS'].includes(item.label.toUpperCase())
                const isLockedByCaja = !cajaAbierta && needsCaja && !isBlocked

                return (
                  <NavLink
                    key={index}
                    to={isBlocked || isLockedByCaja ? '#' : item.path}
                    onClick={(e) => (isBlocked || isLockedByCaja) && e.preventDefault()}
                    className={`group flex flex-col border border-gray-200 rounded-[2rem] w-full bg-white transition-all duration-500 overflow-hidden ${
                      isBlocked || isLockedByCaja
                        ? 'grayscale opacity-60 cursor-not-allowed shadow-none'
                        : 'cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-900/15 hover:-translate-y-2'
                    }`}
                  >
                    <header
                      className={`h-14 flex justify-between items-center px-6 border-b border-gray-50 bg-gray-50/50 transition-colors ${!isBlocked && !isLockedByCaja && 'group-hover:bg-amber-50'}`}
                    >
                      <h2
                        className={`text-[11px] font-black uppercase tracking-widest italic transition-colors ${isBlocked || isLockedByCaja ? 'text-gray-400' : 'text-[#375A65] group-hover:text-amber-700'}`}
                      >
                        {item.label}
                      </h2>
                      {isBlocked ? (
                        <MdLock className="text-rose-500" size={18} />
                      ) : isLockedByCaja ? (
                        <MdErrorOutline className="text-amber-500" size={18} />
                      ) : (
                        <MdTrendingUp
                          className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          size={18}
                        />
                      )}
                    </header>

                    <main className="p-10 flex flex-col items-center justify-center gap-4 relative">
                      <div
                        className={`transition-all duration-300 transform ${isBlocked || isLockedByCaja ? 'text-gray-300' : 'text-[#375A65] group-hover:text-amber-500 group-hover:scale-90'}`}
                      >
                        <item.icon size={65} />
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-lg font-black font-mono transition-colors ${isBlocked || isLockedByCaja ? 'text-gray-300' : 'text-gray-800 group-hover:text-amber-600'}`}
                        >
                          {isBlocked
                            ? 'BLOQUEADO'
                            : isLockedByCaja
                              ? 'CAJA CERRADA'
                              : stats[item.label.toUpperCase()] || '0.00'}
                        </p>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-tighter transition-all transform ${isBlocked || isLockedByCaja ? 'text-rose-400 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                        >
                          {isBlocked
                            ? 'Solo nivel Administrador'
                            : isLockedByCaja
                              ? 'Apertura requerida'
                              : 'Ver detalles del módulo'}
                        </span>
                      </div>

                      {!isBlocked && !isLockedByCaja && (
                        <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-amber-400 group-hover:w-full transition-all duration-700 ease-in-out" />
                      )}
                    </main>
                  </NavLink>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default Home
