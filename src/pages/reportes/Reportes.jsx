import { useState, useEffect, useMemo } from 'react'
import {
  MdTimeline,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdCalendarToday,
  MdSearchOff,
  MdBarChart,
  MdAccountBalanceWallet,
  MdAssignmentReturn,
  MdCloudDownload,
  MdHistory,
  MdErrorOutline,
} from 'react-icons/md'
import { FaFilePdf, FaFileExcel, FaExternalLinkAlt } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  movimientoAPI,
  reporteAPI,
} from '../../api/index.api'

const Reportes = () => {
  const token = useAuthStore((store) => store.token)

  const [movimientos, setMovimientos] = useState([])
  const [cxc, setCxc] = useState([])
  const [cxp, setCxp] = useState([])
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resMov, resCXC, resCXP, resRepor] = await Promise.all([
        movimientoAPI.listarTodos(token),
        cuentasPorCobrarAPI.listarTodas(token),
        cuentasPorPagarAPI.listarTodas(token),
        reporteAPI.listarTodos(token),
      ])
      setMovimientos(resMov.data.movimientos || [])
      setCxc(resCXC.data.cuentas || [])
      setCxp(resCXP.data.cuentas || [])
      setReportes(resRepor.data.reportes || [])
    } catch (error) {
      console.error('Error Aroma de Oro:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const matchFecha =
        !fechaInicio || !fechaFin
          ? true
          : new Date(m.fecha) >= new Date(fechaInicio) && new Date(m.fecha) <= new Date(fechaFin)
      const matchCat = categoriaFiltro === 'TODOS' ? true : m.categoria === categoriaFiltro
      return matchFecha && matchCat
    })
  }, [movimientos, fechaInicio, fechaFin, categoriaFiltro])

  const validacion = useMemo(() => {
    const hayDatos = movimientosFiltrados.length > 0
    const fechasCompletas = fechaInicio !== '' && fechaFin !== ''
    const ordenCorrecto = new Date(fechaInicio) <= new Date(fechaFin)

    return {
      puedeGenerar: hayDatos && fechasCompletas && ordenCorrecto,
      errorMsg: !fechasCompletas
        ? 'Seleccione rango de fechas'
        : !ordenCorrecto
          ? 'Fecha inicial mayor a final'
          : !hayDatos
            ? 'No hay movimientos para estos filtros'
            : null,
    }
  }, [movimientosFiltrados, fechaInicio, fechaFin])

  const stats = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipoMovimiento === 'Ingreso')
      .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)
    const egresos = movimientos
      .filter((m) => m.tipoMovimiento === 'Egreso')
      .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)
    const saldoCaja = ingresos - egresos
    const totalCXC = cxc
      .filter((c) => c.estado === 'Pendiente')
      .reduce((acc, curr) => acc + parseFloat(curr.montoPorCobrar), 0)
    const totalCXP = cxp
      .filter((p) => p.estado === 'Pendiente')
      .reduce((acc, curr) => acc + parseFloat(curr.saldoPendiente || curr.montoPorPagar), 0)

    return [
      {
        label: 'Saldo en Caja',
        value: saldoCaja,
        icon: <MdAccountBalanceWallet />,
        color: 'text-gray-900',
        bg: 'bg-gray-100',
        sub: 'Caja Actual',
      },
      {
        label: 'Ingresos Totales',
        value: ingresos,
        icon: <MdTrendingUp />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        sub: 'Entradas',
      },
      {
        label: 'Egresos Totales',
        value: egresos,
        icon: <MdTrendingDown />,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        sub: 'Salidas',
      },
      {
        label: 'Por Cobrar',
        value: totalCXC,
        icon: <MdTimeline />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        sub: 'Cartera',
      },
      {
        label: 'Por Pagar',
        value: totalCXP,
        icon: <MdAssignmentReturn />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        sub: 'Deudas',
      },
    ]
  }, [movimientos, cxc, cxp])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Balance y Reportes
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
              Gestión Financiera Aroma de Oro
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <MdBarChart size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {/* KPIs - FUENTE MÁS GRANDE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col hover:border-amber-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm text-2xl`}
                >
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {stat.sub}
                </span>
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                {stat.label}
              </span>
              <span
                className={`text-2xl font-black ${stat.label === 'Egresos Totales' ? 'text-rose-600' : 'text-gray-800'} font-mono tracking-tighter`}
              >
                ${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* PANEL DE FILTROS */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                <MdFilterList className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                  Generar Reporte
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                      Desde
                    </label>
                    <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-200 px-5 focus-within:border-amber-400 transition-all">
                      <MdCalendarToday className="text-amber-500 mr-3" size={20} />
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm font-bold text-gray-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                      Hasta
                    </label>
                    <div
                      className={`flex items-center h-14 bg-gray-50 rounded-2xl border px-5 transition-all ${new Date(fechaInicio) > new Date(fechaFin) ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-amber-400'}`}
                    >
                      <MdCalendarToday className="text-amber-500 mr-3" size={20} />
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm font-bold text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                    Categoría
                  </label>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-5 text-sm font-black uppercase text-gray-800 outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="TODOS">Todas las categorías</option>
                    <option value="Venta">Ventas</option>
                    <option value="Compra">Compras</option>
                    <option value="Gasto">Gastos</option>
                    <option value="Nomina">Nómina</option>
                  </select>
                </div>

                {!validacion.puedeGenerar && (
                  <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <MdErrorOutline className="text-rose-500 flex-shrink-0" size={20} />
                    <span className="text-[11px] font-black text-rose-600 uppercase leading-tight tracking-wider">
                      {validacion.errorMsg}
                    </span>
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <button
                    disabled={!validacion.puedeGenerar || generating}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-xl transition-all flex justify-center items-center gap-3 border-b-4 ${validacion.puedeGenerar ? 'bg-gray-900 text-amber-400 border-amber-600 active:scale-95' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                  >
                    <MdCloudDownload size={22} /> {generating ? 'Procesando...' : 'Subir a la Nube'}
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={!validacion.puedeGenerar}
                      className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-[11px] font-black uppercase hover:bg-gray-50 transition-all disabled:opacity-30"
                    >
                      <FaFilePdf className="text-red-500 text-lg" /> PDF
                    </button>
                    <button
                      disabled={!validacion.puedeGenerar}
                      className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-[11px] font-black uppercase hover:bg-gray-50 transition-all disabled:opacity-30"
                    >
                      <FaFileExcel className="text-green-500 text-lg" /> EXCEL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE PREVISUALIZACIÓN - TEXTO MÁS LEGIBLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[550px]">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Previsualización del Reporte
                </h3>
                <span
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase ${movimientosFiltrados.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}
                >
                  {movimientosFiltrados.length} Movimientos
                </span>
              </div>
              {movimientosFiltrados.length === 0 ? (
                <div className="py-40 flex flex-col items-center">
                  <MdSearchOff className="text-gray-200" size={80} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest">
                    No hay datos disponibles
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 text-xs text-gray-400 font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-6 text-left">Fecha</th>
                        <th className="px-8 py-6 text-left">Categoría</th>
                        <th className="px-8 py-6 text-center">Tipo</th>
                        <th className="px-8 py-6 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 uppercase font-bold text-[13px]">
                      {movimientosFiltrados.map((mov) => (
                        <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-gray-800">
                            {new Date(mov.fecha).toLocaleDateString('es-EC')}
                          </td>
                          <td className="px-8 py-5 text-gray-500">{mov.categoria}</td>
                          <td className="px-8 py-5 text-center">
                            <span
                              className={`px-4 py-1.5 rounded-full text-[11px] font-black ${mov.tipoMovimiento === 'Ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                            >
                              {mov.tipoMovimiento}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-gray-900 text-base">
                            ${parseFloat(mov.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HISTORIAL - TEXTO MÁS LEGIBLE */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8 border-l-4 border-gray-900 pl-5">
            <MdHistory size={32} className="text-gray-900" />
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Historial de Reportes
              </h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
                Documentos almacenados en la nube
              </p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
            {reportes.length === 0 ? (
              <div className="py-24 flex flex-col items-center">
                <MdSearchOff size={60} className="text-gray-200" />
                <p className="text-gray-400 text-xs font-black uppercase mt-6 tracking-widest">
                  Aún no hay reportes en el historial
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-900 text-amber-400 text-xs font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6 text-left">Nombre</th>
                      <th className="px-8 py-6 text-center">Formato</th>
                      <th className="px-8 py-6 text-center">Rango</th>
                      <th className="px-8 py-6 text-center">Fecha de Creación</th>
                      <th className="px-8 py-6 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 uppercase text-[13px] font-bold">
                    {reportes.map((rep) => (
                      <tr key={rep.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-8 py-6 font-black text-gray-800">{rep.nombre}</td>
                        <td className="px-8 py-6 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[11px] font-black ${rep.formato === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                          >
                            {rep.formato}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center text-gray-500 italic font-medium">
                          {rep.rangoFechas}
                        </td>
                        <td className="px-8 py-6 text-center text-gray-600">
                          {new Date(rep.createdAt).toLocaleDateString('es-EC')}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <a
                            href={rep.urlCloudinary}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 bg-gray-100 hover:bg-gray-900 hover:text-white px-5 py-3 rounded-2xl transition-all text-gray-700 font-black text-xs"
                          >
                            <FaExternalLinkAlt size={12} /> ABRIR
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Reportes
