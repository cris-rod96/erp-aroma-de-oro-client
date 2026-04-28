import { useEffect, useState } from 'react'
import { NavLink, useOutletContext } from 'react-router-dom'
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
import { Loading } from '../../components/index.components'
import { ITEMS_DATA } from '../../data'
import { useAuthStore } from '../../store/useAuthStore'

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

        // --- EXTRACCIÓN Y NORMALIZACIÓN ---
        const dataUsuarios = respUsuarios.data?.usuarios || []
        const dataProductores = respProductores.data?.productores || []
        const dataCompradores = respCompradores.data?.compradores || []
        const dataTrabajadores = respTrabajadores.data?.trabajadores || []
        const dataLiquidaciones = respLiquidaciones.data?.liquidaciones || []
        const dataVentas = respVentas.data?.ventas || []
        const dataAnticipos = respAnticipos.data?.anticipos || respAnticipos.data || []
        const dataPrestamos = respPrestamos.data?.prestamos || respPrestamos.data || []
        const dataGastos = respGastos.data?.gastos || []
        const cajaData = respCajaActiva.data?.caja

        const hoyLocal = new Date().toLocaleDateString('en-CA')
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

        const esDeHoy = (fechaDb) => {
          if (!fechaDb) return false
          const fechaLocal = new Date(fechaDb).toLocaleDateString('en-CA')
          return fechaLocal === hoyLocal
        }

        // --- LÓGICA DE PLURALIZACIÓN ---
        const plural = (count, singular, pluralStr) =>
          `${count} ${count === 1 ? singular : pluralStr}`

        // Cálculos numéricos
        const activosCount = dataUsuarios.filter((u) => u.estaActivo).length
        const liqHoyCount = dataLiquidaciones.filter((l) => esDeHoy(l.createdAt || l.fecha)).length
        const liqTotalCount = dataLiquidaciones.length

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
          .reduce((acc, a) => acc + parseFloat(a.monto || a.montoAnticipo || 0), 0)
        const totalAntSaldo = dataAnticipos.reduce(
          (acc, a) => acc + parseFloat(a.saldoPendiente || a.monto || 0),
          0
        )

        // --- ACTUALIZACIÓN DE ESTADOS ---
        setStats({
          USUARIOS: { p: plural(activosCount, 'Activo', 'Activos') },
          NÓMINA: { p: plural(dataTrabajadores.length, 'Empleado', 'Empleados') },
          PRODUCTORES: { p: plural(dataProductores.length, 'Productor', 'Productores') },
          COMPRADORES: { p: plural(dataCompradores.length, 'Comprador', 'Compradores') },
          COMPRAS: {
            p: plural(liqHoyCount, 'Compra Hoy', 'Compras Hoy'),
            s: `Total: ${liqTotalCount}`,
          },
          CAJAS: { p: formatter.format(cajaData ? parseFloat(cajaData.saldoActual || 0) : 0) },
          VENTAS: {
            p: `${formatter.format(vtaHoy)} Hoy`,
            s: `Total: ${formatter.format(vtaTotal)}`,
          },
          ANTICIPOS: {
            p: `${formatter.format(antHoy)} Hoy`,
            s: `Saldo: ${formatter.format(totalAntSaldo)}`,
          },
          PRÉSTAMOS: {
            p: `${formatter.format(dataPrestamos.filter((p) => esDeHoy(p.createdAt || p.fecha)).reduce((acc, p) => acc + parseFloat(p.monto || 0), 0))} Hoy`,
            s: `Saldo: ${formatter.format(dataPrestamos.reduce((acc, p) => acc + parseFloat(p.saldoPendiente || 0), 0))}`,
          },
          GASTOS: {
            p: `${formatter.format(gstHoy)} Hoy`,
            s: `Total: ${formatter.format(gstTotal)}`,
          },
          'POR COBRAR': {
            p: formatter.format(
              (respCuentasPorCobrar.data?.cuentasPorCobrar || []).reduce(
                (acc, c) => acc + parseFloat(c.montoPorCobrar || 0),
                0
              )
            ),
          },
          'POR PAGAR': {
            p: formatter.format(
              (respCuentasPorPagar.data?.cuentasPorPagar || []).reduce(
                (acc, c) => acc + parseFloat(c.saldoPendiente || 0),
                0
              )
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
          {/* SECCIÓN DE CUMPLEAÑOS */}
          {(cumplesHoy.length > 0 || cumplesManana.length > 0) && (
            <div className="mb-10 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">
                  Celebraciones del Equipo
                </span>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HOY */}
                {cumplesHoy.map((cumple) => (
                  <div
                    key={cumple.id}
                    className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-[2rem] shadow-xl shadow-amber-200/50 flex items-center gap-5 border-2 border-white/20"
                  >
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md text-white">
                      <span className="text-2xl">🎂</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-black uppercase italic tracking-tighter text-lg leading-none">
                        {cumple.mensaje}
                      </h3>
                      <p className="text-amber-100 text-[11px] font-bold mt-1 uppercase tracking-wider">
                        {cumple.detalles} — 🎉 ¡Felicidades!
                      </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-20 text-white transform -rotate-12">
                      <span className="text-8xl">🎈</span>
                    </div>
                  </div>
                ))}

                {/* MAÑANA */}
                {cumplesManana.map((cumple) => (
                  <div
                    key={cumple.id}
                    className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-5"
                  >
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 border border-blue-100">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-black uppercase italic tracking-tighter text-lg leading-none">
                        {cumple.mensaje}
                      </h3>
                      <p className="text-gray-400 text-[11px] font-bold mt-1 uppercase tracking-wider">
                        {cumple.detalles} — Prepárale una sorpresa
                      </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-gray-900 transform -rotate-12">
                      <span className="text-8xl">🍰</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                      ? 'grayscale opacity-60 cursor-not-allowed shadow-none'
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
                      className={`${isBlocked || isLockedByCaja ? 'text-gray-300' : 'text-[#375A65] group-hover:text-amber-500'} transition-colors duration-300`}
                    >
                      <item.icon size={55} />
                    </div>

                    <div className="text-center w-full">
                      <p className="text-xl font-black font-mono text-gray-800 leading-tight">
                        {isBlocked ? 'BLOQUEADO' : isLockedByCaja ? 'SIN CAJA' : data?.p || '---'}
                      </p>

                      {data?.s && !isBlocked && !isLockedByCaja && (
                        <div className="mt-3 bg-amber-100/80 px-4 py-1.5 rounded-xl border border-amber-200 inline-block">
                          <p className="text-[11px] font-black text-amber-800 uppercase tracking-tight leading-none">
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
