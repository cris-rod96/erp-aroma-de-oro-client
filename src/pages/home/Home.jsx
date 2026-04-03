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
import { Container, CumplesTrabajadores, Loading } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  anticipoAPI,
  cajaAPI,
  compradorAPI,
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  empresaAPI,
  gastoAPI,
  liquidacionAPI,
  productorAPI,
  trabajadorAPI,
  usuarioAPI,
  ventaAPI,
} from '../../api/index.api'
import prestamoAPI from '../../api/prestamo/prestamo.api'

const Home = () => {
  const { hiddenMenu } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensajeLoading, setMensajeLoading] = useState('Sincronizando base de datos...')

  const [cumplesHoy, setCumplesHoy] = useState([])
  const [cumplesManana, setCumplesManana] = useState([])
  const [cajaAbierta, setCajaAbierta] = useState(true)
  const [empresaRegistrada, setEmpresaRegistrada] = useState(true)

  const token = useAuthStore((store) => store.token)
  const user = useAuthStore((state) => state.user)
  const estaHabilitado = user?.rol === 'Administrador' || user?.rol === 'Contador'

  const [stats, setStats] = useState({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        setMensajeLoading('Sincronizando base de datos...')

        const [
          respUsuarios,
          respProductores,
          respCompradores,
          respTrabajadores,
          respLiquidaciones,
          respCajaActiva,
          respVentas,
          respCuentasPorPagar,
          respCuentasPorCobrar,
          respEmpresa,
          respCumples,
          respAnticipos,
          respPrestamos,
          respGastos,
        ] = await Promise.all([
          usuarioAPI.listarUsuarios(token),
          productorAPI.listarTodos(token),
          compradorAPI.listarTodos(token),
          trabajadorAPI.listarTodos(token),
          liquidacionAPI.listarTodas(token),
          cajaAPI.obtenerCajaAbierta(token, user?.id),
          ventaAPI.listarVentas(token),
          cuentasPorPagarAPI.listarPendientes(token),
          cuentasPorCobrarAPI.listarPendientes(token),
          empresaAPI.obtenerInformacion(token),
          trabajadorAPI.listarProximosCumples(token),
          anticipoAPI.listarTodos(token),
          prestamoAPI.listarTodos(token),
          gastoAPI.listarGastos(token),
        ])

        const dataUsuarios = respUsuarios.data?.usuarios || []
        const dataProductores = respProductores.data?.productores || []
        const dataCompradores = respCompradores.data?.compradores || []
        const dataTrabajadores = respTrabajadores.data?.trabajadores || []
        const dataLiquidaciones = respLiquidaciones.data?.liquidaciones || []
        const dataVentas = respVentas.data?.ventas || []
        const dataCxp = respCuentasPorPagar.data?.cuentasPorPagar || []
        const dataCxc = respCuentasPorCobrar.data?.cuentasPorCobrar || []
        const dataAnticipos = respAnticipos.data?.anticipos || respAnticipos.data || []
        const dataPrestamos = respPrestamos.data?.prestamos || respPrestamos.data || []
        const dataGastos = respGastos.data?.gastos || []
        const cajaData = respCajaActiva.data?.caja

        // Fecha local YYYY-MM-DD
        const hoyLocal = new Date().toLocaleDateString('en-CA')
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

        const esDeHoy = (f) => (f ? f.split('T')[0] === hoyLocal : false)

        // Cálculos
        const liqHoy = dataLiquidaciones.filter((l) => esDeHoy(l.createdAt || l.fecha)).length
        const vtaHoy = dataVentas
          .filter((v) => esDeHoy(v.createdAt))
          .reduce((acc, v) => acc + parseFloat(v.totalFactura || 0), 0)
        const vtaTotal = dataVentas.reduce((acc, v) => acc + parseFloat(v.totalFactura || 0), 0)

        const gstHoy = dataGastos
          .filter((g) => esDeHoy(g.createdAt || g.fecha))
          .reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)
        const gstTotal = dataGastos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0)

        const antHoy = dataAnticipos
          .filter((a) => esDeHoy(a.createdAt || a.fecha))
          .reduce((acc, a) => acc + parseFloat(a.monto || 0), 0)
        const totalAnt = dataAnticipos.reduce(
          (acc, a) => acc + parseFloat(a.saldoPendiente || 0),
          0
        )

        const preHoy = dataPrestamos
          .filter((p) => esDeHoy(p.createdAt || p.fecha))
          .reduce((acc, p) => acc + parseFloat(p.monto || 0), 0)
        const totalPre = dataPrestamos.reduce(
          (acc, p) => acc + parseFloat(p.saldoPendiente || 0),
          0
        )

        setStats({
          USUARIOS: {
            p: `${dataUsuarios.filter((u) => u.estaActivo).length} ${dataUsuarios.filter((u) => u.estaActivo).length === 1 ? 'Activo' : 'Activos'} `,
          },
          NÓMINA: {
            p: `${dataTrabajadores.length} ${dataTrabajadores.length === 1 ? 'Empleado' : 'Empleados'} `,
          },
          COMPRAS: { p: `${liqHoy} Hoy`, s: `${dataLiquidaciones.length} Total` },
          PRODUCTORES: {
            p: `${dataProductores.length} ${dataProductores.length === 1 ? 'Productor' : 'Productores'} `,
          },
          COMPRADORES: {
            p: `${dataCompradores.length} ${dataCompradores.length === 1 ? 'Comprador' : 'Compradores'} `,
          },
          CAJAS: { p: formatter.format(cajaData ? parseFloat(cajaData.saldoActual || 0) : 0) },
          VENTAS: {
            p: `${formatter.format(vtaHoy)} Hoy`,
            s: `Total: ${formatter.format(vtaTotal)}`,
          },
          ANTICIPOS: {
            p: `${formatter.format(antHoy)} Hoy`,
            s: `Saldo: ${formatter.format(totalAnt)}`,
          },
          PRÉSTAMOS: {
            p: `${formatter.format(preHoy)} Hoy`,
            s: `Saldo: ${formatter.format(totalPre)}`,
          },
          GASTOS: {
            p: `${formatter.format(gstHoy)} Hoy`,
            s: `Total: ${formatter.format(gstTotal)}`,
          },
          'POR COBRAR': {
            p: formatter.format(
              dataCxc.reduce((acc, c) => acc + parseFloat(c.montoPorCobrar || 0), 0)
            ),
          },
          'POR PAGAR': {
            p: formatter.format(
              dataCxp.reduce((acc, c) => acc + parseFloat(c.saldoPendiente || 0), 0)
            ),
          },
          INVENTARIO: { p: 'Ver bodega' },
          KARDEX: { p: 'Ver movimientos' },
          REPORTES: { p: 'PDF/Excel' },
          CONFIGURACIÓN: { p: 'Ajustes' },
        })

        setCajaAbierta(!!cajaData)
        setEmpresaRegistrada(!!respEmpresa.data?.empresa)
        setCumplesHoy(respCumples.data?.cumples?.alertasHoy || [])
        setCumplesManana(respCumples.data?.cumples?.alertasManana || [])
      } catch (err) {
        console.error(err)
        setError('Error al sincronizar datos')
      } finally {
        setLoading(false)
      }
    }
    if (token && user?.id) fetchDashboardData()
  }, [token, user?.id])

  return (
    <>
      {loading && <Loading mensaje={mensajeLoading} />}
      <section
        className={`flex-1 bg-[#F5F9FF] min-h-screen transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className={`flex flex-col ${hiddenMenu ? 'w-[90%]' : 'w-[80%] pl-56'} mx-auto py-32 px-10`}
        >
          {!loading && (
            <CumplesTrabajadores cumplesHoy={cumplesHoy} cumplesManana={cumplesManana} />
          )}

          <div
            className={`grid md:grid-cols-2 sm:grid-cols-1 gap-10 ${hiddenMenu ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
          >
            {ITEMS_DATA.map((item, index) => {
              const label = item.label.toUpperCase()
              const isBlocked = item.onlyAdmin && !estaHabilitado
              const isLockedByCaja =
                !cajaAbierta && ['VENTAS', 'CAJAS', 'COMPRAS'].includes(label) && !isBlocked
              const data = stats[label]

              return (
                <NavLink
                  key={index}
                  to={isBlocked || isLockedByCaja ? '#' : item.path}
                  className={`group flex flex-col border border-gray-200 rounded-[2.5rem] bg-white transition-all duration-500 overflow-hidden ${
                    isBlocked || isLockedByCaja
                      ? 'grayscale opacity-60 cursor-not-allowed'
                      : 'hover:shadow-2xl hover:-translate-y-2'
                  }`}
                >
                  <header className="h-14 flex justify-between items-center px-8 border-b border-gray-50 bg-gray-50/30">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-[#375A65] italic">
                      {item.label}
                    </h2>
                  </header>

                  <main className="p-10 flex flex-col items-center gap-4">
                    <div
                      className={`${isBlocked || isLockedByCaja ? 'text-gray-300' : 'text-[#375A65] group-hover:text-amber-500'} transition-colors`}
                    >
                      <item.icon size={55} />
                    </div>

                    <div className="text-center w-full">
                      <p className="text-xl font-black font-mono text-gray-800 leading-tight">
                        {isBlocked ? 'BLOQUEADO' : isLockedByCaja ? 'SIN CAJA' : data?.p || '---'}
                      </p>

                      {data?.s && !isBlocked && !isLockedByCaja && (
                        <div className="mt-2 bg-amber-100 px-4 py-1 rounded-full inline-block border border-amber-200">
                          <p className="text-[12px] font-black text-amber-700 uppercase tracking-tight">
                            {data.s}
                          </p>
                        </div>
                      )}
                    </div>
                  </main>
                </NavLink>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
