import { useState, useEffect } from 'react'
import { ITEMS_DATA } from '../../data'
import { NavLink, useOutletContext } from 'react-router-dom'
import { MdTrendingUp, MdLock } from 'react-icons/md' // Importamos MdLock
import Swal from 'sweetalert2'
import { Loading } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  cajaAPI,
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  liquidacionAPI,
  productoAPI,
  productorAPI,
  trabajadorAPI,
  usuarioAPI,
  ventaAPI,
} from '../../api/index.api'

const Home = () => {
  const { hiddenMenu } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [mensajeLoading, setMensajeLoading] = useState('Iniciando sistema...')

  const token = useAuthStore((store) => store.token)
  const isAdmin = useAuthStore((state) => state.isAdmin) // Obtenemos el rol

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
      try {
        setMensajeLoading('Sincronizando base de datos...')

        const [
          respUsuarios,
          respProductores,
          respTrabajadores,
          respLiquidaciones,
          respProductos,
          respCajaActiva,
          respVentas,
          respCuentasPorPagar,
          respCuentasPorCobrar,
        ] = await Promise.all([
          usuarioAPI.listarUsuarios(token),
          productorAPI.listarTodos(token),
          trabajadorAPI.listarTodos(token),
          liquidacionAPI.listarTodas(token),
          productoAPI.listarProductos(token),
          cajaAPI.obtenerCajaAbierta(token),
          ventaAPI.listarVentas(token),
          cuentasPorPagarAPI.listarPendientes(token),
          cuentasPorCobrarAPI.listarPendientes(token),
        ])

        const usuariosData = respUsuarios.data.usuarios || []
        const countActivos = usuariosData.filter((u) => u.estaActivo).length
        const hoy = new Date().toISOString().split('T')[0]
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

        const liquidacionesHoy = (respLiquidaciones.data.liquidaciones || []).filter((liq) => {
          return new Date(liq.fecha).toISOString().split('T')[0] === hoy
        }).length

        const stockTotal = (respProductos.data.productos || []).reduce(
          (acc, prod) => acc + parseFloat(prod.stock || 0),
          0
        )
        const cajaData = respCajaActiva.data.caja
        const dineroEnCaja = cajaData
          ? parseFloat(
              parseFloat(cajaData.saldoActual) > 0 ? cajaData.saldoActual : cajaData.saldoActual
            )
          : 0

        let totalVentasHoy = 0
        ;(respVentas.data.ventas || []).forEach((v) => {
          if (new Date(v.fecha).toISOString().split('T')[0] === hoy)
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
          INVENTARIO: `${stockTotal.toFixed(2)} qq`,
          PRODUCTORES: `${respProductores.data.productores?.length || 0} Total`,
          CAJAS: formatter.format(dineroEnCaja),
          VENTAS: formatter.format(totalVentasHoy),
          'POR COBRAR': formatter.format(totalPorCobrar),
          'POR PAGAR': formatter.format(totalPorPagar),
        }))
      } catch (error) {
        console.error('Error en Dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchDashboardData()
  }, [token])

  return (
    <>
      {loading && <Loading mensaje={mensajeLoading} />}

      <section
        className={`flex-1 bg-[#F5F9FF] min-h-screen transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className={`grid md:grid-cols-2 sm:grid-cols-1 items-center ${
            hiddenMenu ? 'w-[90%] lg:grid-cols-4' : 'w-[80%] pl-56 lg:grid-cols-3'
          } mx-auto gap-10 px-10 py-28 transition-all duration-500`}
        >
          {ITEMS_DATA.map((item, index) => {
            const isBlocked = item.onlyAdmin && !isAdmin

            return (
              <NavLink
                key={index}
                to={isBlocked ? '#' : item.path}
                onClick={(e) => isBlocked && e.preventDefault()}
                className={`group flex flex-col border border-gray-200 rounded-[2rem] w-full bg-white transition-all duration-500 overflow-hidden ${
                  isBlocked
                    ? 'grayscale opacity-60 cursor-not-allowed shadow-none'
                    : 'cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-900/15 hover:-translate-y-2'
                }`}
              >
                <header
                  className={`h-14 flex justify-between items-center px-6 border-b border-gray-50 bg-gray-50/50 transition-colors ${!isBlocked && 'group-hover:bg-amber-50'}`}
                >
                  <h2
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-colors ${isBlocked ? 'text-gray-400' : 'text-[#375A65] group-hover:text-amber-700'}`}
                  >
                    {item.label}
                  </h2>
                  {isBlocked ? (
                    <MdLock className="text-rose-500" size={18} />
                  ) : (
                    <MdTrendingUp
                      className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      size={18}
                    />
                  )}
                </header>

                <main className="p-10 flex flex-col items-center justify-center gap-4 relative">
                  <div
                    className={`transition-all duration-300 transform ${isBlocked ? 'text-gray-300' : 'text-[#375A65] group-hover:text-amber-500 group-hover:scale-90'}`}
                  >
                    <item.icon size={65} />
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-lg font-black font-mono transition-colors ${isBlocked ? 'text-gray-300' : 'text-gray-800 group-hover:text-amber-600'}`}
                    >
                      {isBlocked ? 'BLOQUEADO' : stats[item.label.toUpperCase()] || '0.00'}
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-tighter transition-all transform ${isBlocked ? 'text-rose-400 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                    >
                      {isBlocked ? 'Solo nivel Administrador' : 'Ver detalles del módulo'}
                    </span>
                  </div>

                  {!isBlocked && (
                    <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-amber-400 group-hover:w-full transition-all duration-700 ease-in-out" />
                  )}
                </main>
              </NavLink>
            )
          })}
        </div>
      </section>
    </>
  )
}

export default Home
