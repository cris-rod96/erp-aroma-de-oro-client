import { useState, useEffect, useMemo } from 'react'
import {
  MdTimeline,
  MdTrendingUp,
  MdFilterList,
  MdSearchOff,
  MdBarChart,
  MdAccountBalanceWallet,
  MdAssignmentReturn,
  MdErrorOutline,
  MdDateRange,
  MdKeyboardArrowDown,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdAttachMoney,
  MdInventory2,
  MdPeople,
} from 'react-icons/md'
import { FaFilePdf } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  empresaAPI,
  movimientoAPI,
  reporteAPI,
  cajaAPI,
  productoAPI,
} from '../../api/index.api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { exportarIngresosPDF } from '../../utils/ingresosReport'
import { exportarEgresosPDF } from '../../utils/egresosReport'
import { exportarSueldosPDF } from '../../utils/sueldosReport'
import { exportarPrestamosPDF } from '../../utils/prestamosReport'
import { exportarGastosPDF } from '../../utils/gastosReport'
import { exportarInventarioPDF } from '../../utils/inventarioReport'
import { exportarAnticiposPDF } from '../../utils/anticiposReport'
import { exportarReporteGeneralPDF } from '../../utils/generalReport'

const PERIODOS = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
}

const Reportes = () => {
  const token = useAuthStore((store) => store.token)
  const user = useAuthStore((store) => store.data)

  const [error, setError] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cxc, setCxc] = useState([])
  const [cxp, setCxp] = useState([])
  const [cajas, setCajas] = useState([])
  const [loading, setLoading] = useState(false)
  const [empresa, setEmpresa] = useState(null)
  const [productos, setProductos] = useState([])

  const [periodoSel, setPeriodoSel] = useState(PERIODOS.MENSUAL)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS')

  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 10

  useEffect(() => {
    const hoy = new Date()
    let inicio = new Date()

    switch (periodoSel) {
      case PERIODOS.DIARIO:
        // Seteamos el inicio a las 00:00:00 del día de hoy
        inicio.setHours(0, 0, 0, 0)
        break
      case PERIODOS.SEMANAL:
        inicio.setDate(hoy.getDate() - 7)
        break
      case PERIODOS.MENSUAL:
        inicio.setMonth(hoy.getMonth() - 1)
        break
      case PERIODOS.TRIMESTRAL:
        inicio.setMonth(hoy.getMonth() - 3)
        break
      case PERIODOS.ANUAL:
        inicio.setFullYear(hoy.getFullYear() - 1)
        break
    }

    // Al usar toISOString().split('T')[0], ahora "inicio" será "2026-03-25"
    // y permitirá traer lo que se haya registrado hoy.
    setFechaInicio(inicio.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
    setPaginaActual(1)
  }, [periodoSel])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resMov, resCXC, resCXP, resEmpresa, resCajas, resProductos] = await Promise.all([
        movimientoAPI.listarTodos(token),
        cuentasPorCobrarAPI.listarTodas(token),
        cuentasPorPagarAPI.listarTodas(token),
        empresaAPI.obtenerInformacion(token),
        cajaAPI.listarTodas(token),
        productoAPI.listarProductos(token),
      ])
      console.log(resMov.data.movimientos)
      setMovimientos(resMov.data.movimientos || [])
      setCxc(resCXC.data.cuentasPorCobrar || [])
      setCxp(resCXP.data.cuentasPorPagar || [])
      setEmpresa(resEmpresa.data.empresa || null)
      setCajas(resCajas.data.cajas || [])
      setProductos(resProductos.data.productos || [])
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener información')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      if (!m.fecha) return false
      const fechaMov = new Date(m.fecha)
      const matchFecha =
        fechaMov >= new Date(fechaInicio + 'T00:00:00') &&
        fechaMov <= new Date(fechaFin + 'T23:59:59')

      let matchCat = false

      if (categoriaFiltro === 'TODOS') {
        matchCat = true
      } else if (categoriaFiltro === 'INVENTARIO') {
        // --- LÓGICA ESTRICTA DE BODEGA ---
        // 1. Si es Compra: Debe tener el detalle de la liquidación con sus productos
        const esCompraReal =
          m.detalleCompra && m.detalleCompra.DetalleLiquidacion && m.categoria !== 'Cobro Anticipo'

        // 2. Si es Venta: Debe tener el detalle de la venta con su producto
        const esVentaReal =
          m.detalleVenta && m.detalleVenta.Producto && m.categoria !== 'Cobro Anticipo'

        // Solo entra si es uno de los dos. Los "Cobros de Anticipo" o "Cruces"
        // no tienen DetalleLiquidacion ni Producto directo en el objeto del movimiento,
        // por lo que quedarán fuera automáticamente.
        matchCat = esCompraReal || esVentaReal
      } else {
        // Filtros normales para los otros rubros
        matchCat =
          m.categoria?.toUpperCase() === categoriaFiltro || m.tipoMovimiento === categoriaFiltro
      }

      return matchFecha && matchCat
    })
  }, [movimientos, fechaInicio, fechaFin, categoriaFiltro])

  const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina)
  const indiceUltimoItem = paginaActual * registrosPorPagina
  const indicePrimerItem = indiceUltimoItem - registrosPorPagina
  const movimientosPaginados = useMemo(
    () => movimientosFiltrados.slice(indicePrimerItem, indiceUltimoItem),
    [movimientosFiltrados, paginaActual]
  )

  const stats = useMemo(() => {
    const calc = (cat) =>
      movimientosFiltrados
        .filter((m) => m.categoria?.toUpperCase() === cat)
        .reduce((acc, m) => acc + parseFloat(m.monto || 0), 0)

    return [
      {
        label: 'Nómina Pagada',
        value: calc('NOMINA'),
        icon: <MdPeople />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        sub: 'Pagos Personal',
      },
      {
        label: 'Anticipos/Préstamos',
        value: calc('ANTICIPO') + calc('PRESTAMO'),
        icon: <MdAttachMoney />,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        sub: 'Pendientes',
      },
      {
        label: 'Ingresos Ventas',
        value: movimientosFiltrados
          .filter((m) => m.tipoMovimiento === 'Ingreso')
          .reduce((acc, m) => acc + parseFloat(m.monto || 0), 0),
        icon: <MdTrendingUp />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        sub: 'Entradas Reales',
      },
      {
        label: 'Cuentas x Cobrar',
        value: cxc
          .filter((c) => c.estado === 'Pendiente')
          .reduce((acc, c) => acc + parseFloat(c.montoPorCobrar || 0), 0),
        icon: <MdTimeline />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        sub: 'Cartera Cliente',
      },
      {
        label: 'Cuentas x Pagar',
        value: cxp
          .filter((p) => p.estado === 'Pendiente')
          .reduce((acc, p) => acc + parseFloat(p.saldoPendiente || 0), 0),
        icon: <MdAssignmentReturn />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        sub: 'Deuda Proveedor',
      },
    ]
  }, [movimientosFiltrados, cxc, cxp])

  const handleGenerarPDF = async () => {
    if (movimientosFiltrados.length === 0) {
      return Swal.fire('error', 'No existen movimientos para generar el reporte', 'error')
    }
    switch (categoriaFiltro.toUpperCase()) {
      case 'INGRESO':
        await exportarIngresosPDF(movimientosFiltrados, periodoSel, empresa)
        break
      case 'EGRESO':
        await exportarEgresosPDF(movimientosFiltrados, periodoSel, empresa)
        break
      case 'NOMINA':
        await exportarSueldosPDF(movimientosFiltrados, periodoSel, empresa)
        break
      case 'PRÉSTAMO':
        await exportarPrestamosPDF(movimientosFiltrados, periodoSel, empresa)
        break
      case 'INVENTARIO':
        await exportarInventarioPDF(movimientosFiltrados, productos, periodoSel, empresa)
        break
      case 'ANTICIPO':
        await exportarAnticiposPDF(movimientosFiltrados, periodoSel, empresa)
        break
      case 'GASTO GENERAL':
        console.log(movimientosFiltrados)
        await exportarGastosPDF(movimientosFiltrados, periodoSel, empresa)
        break
      default:
        await exportarReporteGeneralPDF(movimientosFiltrados, cajas, periodoSel, empresa)
        break
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter italic">
              Reportes Maestros
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
              Aroma de Oro | Análisis Contable
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-gray-900 text-amber-400 px-8 py-4 rounded-2xl text-sm font-black uppercase transition-all shadow-xl active:scale-95"
          >
            <MdBarChart size={20} className={loading ? 'animate-spin' : ''} />{' '}
            {loading ? 'Cargando...' : 'Sincronizar Datos'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col hover:border-amber-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
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
              <span className={`text-2xl font-black font-mono tracking-tighter ${stat.color}`}>
                ${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b pb-6">
                <MdFilterList className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                  Filtros Avanzados
                </h2>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Periodo
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.values(PERIODOS).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriodoSel(p)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${periodoSel === p ? 'bg-amber-400 border-amber-500' : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Rubro Específico
                  </label>
                  <div className="relative">
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="w-full h-14 bg-gray-100 border-2 border-transparent rounded-2xl px-6 text-xs font-black uppercase text-gray-800 outline-none appearance-none focus:border-amber-400"
                    >
                      <option value="TODOS">Todos los rubros</option>
                      <option value="NOMINA">Nómina / Sueldos</option>
                      <option value="ANTICIPO">Anticipos</option>
                      <option value="PRÉSTAMO">Préstamos</option>
                      <option value="GASTO GENERAL">Gastos Operativos</option>
                      <option value="INVENTARIO">Mov. Inventario</option>
                      <option value="Ingreso">Solo Ingresos</option>
                      <option value="Egreso">Solo Egresos</option>
                    </select>
                    <MdKeyboardArrowDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={24}
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerarPDF}
                  disabled={movimientosFiltrados.length === 0}
                  className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase transition-all shadow-lg ${movimientosFiltrados.length > 0 ? 'bg-gray-900 text-amber-400 hover:bg-gray-800 scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <FaFilePdf size={18} /> Exportar Reporte Maestro
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[640px]">
              <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MdDateRange className="text-gray-400" size={20} />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Previsualización de Transacciones
                  </h3>
                </div>
              </div>

              {movimientosPaginados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <MdSearchOff className="text-gray-100" size={120} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest italic">
                    Sin datos en este rango
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-8 py-6 text-left">Fecha / Rubro</th>
                          <th className="px-8 py-6 text-left">Descripción / Concepto</th>
                          <th className="px-8 py-6 text-center">Estado</th>
                          <th className="px-8 py-6 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 uppercase font-bold text-[12px]">
                        {movimientosPaginados.map((mov) => (
                          <tr key={mov.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-gray-900">
                                  {new Date(mov.fecha).toLocaleDateString('es-EC')}
                                </span>
                                <span className="text-[9px] text-amber-600 font-black">
                                  {mov.categoria || 'GENERAL'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-gray-500 max-w-xs truncate">
                              {mov.descripcion || 'MOVIMIENTO OPERATIVO'}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black ${mov.tipoMovimiento === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                              >
                                {mov.tipoMovimiento}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right font-mono text-gray-900 text-sm italic">
                              ${parseFloat(mov.monto).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Mostrando{' '}
                      <span className="text-gray-900">
                        {indicePrimerItem + 1} -{' '}
                        {Math.min(indiceUltimoItem, movimientosFiltrados.length)}
                      </span>{' '}
                      de {movimientosFiltrados.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-amber-400 transition-all"
                      >
                        <MdChevronLeft size={20} />
                      </button>
                      <div className="flex items-center gap-1.5">
                        {[...Array(totalPaginas)]
                          .map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPaginaActual(i + 1)}
                              className={`w-9 h-9 rounded-xl text-[11px] font-black italic transition-all ${paginaActual === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400'}`}
                            >
                              {i + 1}
                            </button>
                          ))
                          .slice(
                            Math.max(0, paginaActual - 3),
                            Math.min(totalPaginas, paginaActual + 2)
                          )}
                      </div>
                      <button
                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-amber-400 transition-all"
                      >
                        <MdChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Reportes
