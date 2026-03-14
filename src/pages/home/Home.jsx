import { useState, useEffect } from 'react'
import { ITEMS_DATA } from '../../data'
import { NavLink, useOutletContext } from 'react-router-dom'
import { MdTrendingUp } from 'react-icons/md'
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

  const token = useAuthStore((store) => store.token)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        setMensajeLoading('Sincronizando base de datos...')

        // Ejecutamos todas las llamadas reales que tengas listas
        // Por ahora solo tenemos Usuarios
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
          // Aquí irán las demás APIs: compraAPI.stats(token), etc.
        ])

        // Procesamos Usuarios
        const usuariosData = respUsuarios.data.usuarios || []
        const countActivos = usuariosData.filter((u) => u.estaActivo).length

        const productoresData = respProductores.data.productores || []
        const trabajadoresData = respTrabajadores.data.trabajadores || []
        const liquidacionesData = respLiquidaciones.data.liquidaciones || []
        const productosData = respProductos.data.productos || []
        const cajaData = respCajaActiva.data.caja
        const ventasData = respVentas.data.ventas || []
        const cuentasPorPagarData = respCuentasPorPagar.data.cuentasPorPagar || []
        const cuentasPorCobrarData = respCuentasPorCobrar.data.cuentasPorCobrar || []

        const hoy = new Date().toISOString().split('T')[0]
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

        const liquidacionesHoy = liquidacionesData.filter((liq) => {
          const fechaLiq = new Date(liq.fecha).toISOString().split('T')[0]
          return fechaLiq === hoy
        }).length

        const stockTotal = productosData.reduce((acc, prod) => {
          return acc + parseFloat(prod.stock || 0)
        }, 0)

        const dineroEnCaja = cajaData
          ? parseFloat(
              parseFloat(cajaData.montoEsperado) > 0
                ? cajaData.montoEsperado
                : cajaData.montoApertura
            )
          : 0

        let totalVentasHoy = 0

        ventasData.forEach((v) => {
          if (new Date(v.fecha).toISOString().split('T')[0] === hoy) {
            totalVentasHoy += parseFloat(v.totalFactura || 0)
          }
        })

        const totalPorPagar = cuentasPorPagarData.reduce((acc, c) => {
          return acc + parseFloat(c.saldoPendiente || 0)
        }, 0)

        const totalPorCobrar = cuentasPorCobrarData.reduce((acc, c) => {
          return acc + parseFloat(c.montoPorCobrar || 0)
        }, 0)

        // Actualizamos el objeto de estadísticas
        setStats((prev) => ({
          ...prev,
          USUARIOS: `${countActivos} Activos`,
          // Aquí irás reemplazando los datos ficticios por los reales conforme los tengamos
          NÓMINA: `${trabajadoresData.length} Empleados`,
          COMPRAS: `${liquidacionesHoy} Hoy`,
          INVENTARIO: `${stockTotal.toFixed(2)} qq`,
          PRODUCTORES: `${productoresData.length} Total`,
          CAJAS: formatter.format(dineroEnCaja),
          VENTAS: formatter.format(totalVentasHoy),
          'POR COBRAR': formatter.format(totalPorCobrar),
          'POR PAGAR': formatter.format(totalPorPagar),
        }))
      } catch (error) {
        console.error('Error en Dashboard:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error de Sincronización',
          text: 'No pudimos obtener los datos en tiempo real.',
          confirmButtonColor: '#fbbf24',
        })
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
          {ITEMS_DATA.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className="group flex flex-col border border-gray-200 rounded-[2rem] w-full bg-white cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-900/15 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <header className="h-14 flex justify-between items-center px-6 border-b border-gray-50 bg-gray-50/50 group-hover:bg-amber-50 transition-colors">
                <h2 className="text-[11px] font-black text-[#375A65] uppercase tracking-widest group-hover:text-amber-700 transition-colors italic">
                  {item.label}
                </h2>
                <MdTrendingUp
                  className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  size={18}
                />
              </header>

              <main className="p-10 flex flex-col items-center justify-center gap-4 relative">
                <div className="text-[#375A65] group-hover:text-amber-500 transition-all duration-300 transform group-hover:scale-90">
                  <item.icon size={65} />
                </div>

                <div className="text-center">
                  <p className="text-lg font-black text-gray-800 group-hover:text-amber-600 transition-colors font-mono">
                    {/* Buscamos la estadística por el label del item */}
                    {stats[item.label.toUpperCase()] || '0.00'}
                  </p>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    Ver detalles del módulo
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-amber-400 group-hover:w-full transition-all duration-700 ease-in-out" />
              </main>
            </NavLink>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
