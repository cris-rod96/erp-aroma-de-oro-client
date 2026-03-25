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
} from '../../api/index.api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

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

  const [periodoSel, setPeriodoSel] = useState(PERIODOS.MENSUAL)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS')

  // --- LÓGICA DE PAGINACIÓN EXACTA ---
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 10

  useEffect(() => {
    const hoy = new Date()
    let inicio = new Date()
    switch (periodoSel) {
      case PERIODOS.DIARIO:
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
    setFechaInicio(inicio.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
    setPaginaActual(1)
  }, [periodoSel])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resMov, resCXC, resCXP, resEmpresa, resCajas] = await Promise.all([
        movimientoAPI.listarTodos(token),
        cuentasPorCobrarAPI.listarTodas(token),
        cuentasPorPagarAPI.listarTodas(token),
        empresaAPI.obtenerInformacion(token),
        cajaAPI.listarTodas(token),
      ])
      setMovimientos(resMov.data.movimientos || [])
      setCxc(resCXC.data.cuentasPorCobrar || [])
      setCxp(resCXP.data.cuentasPorPagar || [])
      setEmpresa(resEmpresa.data.empresa || null)
      setCajas(resCajas.data.cajas || [])
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
      const matchCat =
        categoriaFiltro === 'TODOS'
          ? true
          : m.categoria === categoriaFiltro || m.tipoMovimiento === categoriaFiltro
      return matchFecha && matchCat
    })
  }, [movimientos, fechaInicio, fechaFin, categoriaFiltro])

  // --- VARIABLES DE CÁLCULO PARA EL FOOTER ---
  const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina)
  const indiceUltimoItem = paginaActual * registrosPorPagina
  const indicePrimerItem = indiceUltimoItem - registrosPorPagina

  const movimientosPaginados = useMemo(() => {
    return movimientosFiltrados.slice(indicePrimerItem, indiceUltimoItem)
  }, [movimientosFiltrados, paginaActual])

  const stats = useMemo(() => {
    const saldoCajasAbiertas = cajas
      .filter((c) => c.estado === 'Abierta')
      .reduce((acc, c) => acc + parseFloat(c.saldoActual || 0), 0)
    const flujoBancos = movimientosFiltrados.reduce((acc, m) => {
      const monto = parseFloat(m.monto || 0)
      const desc = m.descripcion?.toLowerCase() || ''
      if (desc.includes('transferencia') || desc.includes('depósito') || m.categoria === 'Bancos') {
        return m.tipoMovimiento === 'Ingreso' ? acc + monto : acc - monto
      }
      return acc
    }, 0)
    return [
      {
        label: 'Efectivo Real',
        value: saldoCajasAbiertas,
        icon: <MdAccountBalanceWallet />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        sub: 'Saldo en Caja',
      },
      {
        label: `Bancos (${periodoSel})`,
        value: flujoBancos,
        icon: <MdTrendingUp />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        sub: 'Transferencias',
      },
      {
        label: 'Cartera CXC',
        value: cxc
          .filter((c) => c.estado === 'Pendiente')
          .reduce((acc, c) => acc + parseFloat(c.montoPorCobrar || 0), 0),
        icon: <MdTimeline />,
        color: 'text-gray-900',
        bg: 'bg-gray-100',
        sub: 'Por Cobrar',
      },
      {
        label: 'Deudas CXP',
        value: cxp
          .filter((p) => p.estado === 'Pendiente')
          .reduce((acc, p) => acc + parseFloat(p.saldoPendiente || p.montoPorPagar || 0), 0),
        icon: <MdAssignmentReturn />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        sub: 'Por Pagar',
      },
      {
        label: 'Total Liquidado',
        value: cajas
          .filter((c) => c.estado === 'Cerrada')
          .reduce((acc, c) => acc + parseFloat(c.montoCierre || 0), 0),
        icon: <MdBarChart />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        sub: 'Histórico Cajas',
      },
    ]
  }, [movimientosFiltrados, cxc, cxp, cajas, periodoSel])

  const handleGenerarPDF = async () => {
    /* Mismo código de PDF */
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* Cabecera y Stats se mantienen igual... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter italic">
              Reportes Maestros
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
              Aroma de Oro | Análisis de Liquidez
            </p>
          </div>
          {!error && (
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-gray-900 text-amber-400 px-8 py-4 rounded-2xl text-sm font-black uppercase transition-all shadow-xl active:scale-95"
            >
              <MdBarChart size={20} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Sincronizar' : 'Sincronizar'}
            </button>
          )}
        </div>

        {/* Grid de Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col hover:border-amber-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110`}
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
          {/* Columna Filtros */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b pb-6">
                <MdFilterList className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                  Parámetros
                </h2>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Rango de Tiempo
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
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="w-full h-14 bg-gray-100 border-2 border-transparent rounded-2xl px-6 text-xs font-black uppercase text-gray-800 outline-none appearance-none transition-all focus:border-amber-400 cursor-pointer"
                    >
                      <option value="TODOS">Todos los Movimientos</option>
                      <option value="Ingreso">Ingresos</option>
                      <option value="Egreso">Egresos</option>
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
                  <FaFilePdf size={18} /> Exportar Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Columna Tabla */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[640px]">
              <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MdDateRange className="text-gray-400" size={20} />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Previsualización Datos
                  </h3>
                </div>
              </div>

              {movimientosPaginados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <MdSearchOff className="text-gray-100" size={120} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest italic">
                    No hay registros
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-8 py-6 text-left">Fecha</th>
                          <th className="px-8 py-6 text-left">Categoría</th>
                          <th className="px-8 py-6 text-center">Tipo</th>
                          <th className="px-8 py-6 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 uppercase font-bold text-[13px]">
                        {movimientosPaginados.map((mov) => (
                          <tr key={mov.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-8 py-5 text-gray-800">
                              {new Date(mov.fecha).toLocaleDateString('es-EC')}
                            </td>
                            <td className="px-8 py-5 text-gray-500 text-xs">{mov.categoria}</td>
                            <td className="px-8 py-5 text-center">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black ${mov.tipoMovimiento === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
                              >
                                {mov.tipoMovimiento}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right font-mono text-gray-900 text-base italic">
                              ${parseFloat(mov.monto).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ESTE ES EL FOOTER QUE QUERÍAS EXACTAMENTE IGUAL AL DE USUARIOS */}
                  {/* PIE DE PÁGINA CON BOTONES NUMÉRICOS 3D */}
                  <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                        Mostrando{' '}
                        <span className="text-gray-900">
                          {movimientosFiltrados.length > 0 ? indicePrimerItem + 1 : 0}
                        </span>{' '}
                        a{' '}
                        <span className="text-gray-900">
                          {Math.min(indiceUltimoItem, movimientosFiltrados.length)}
                        </span>{' '}
                        de <span className="text-gray-900">{movimientosFiltrados.length}</span>{' '}
                        registros
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón Anterior */}
                      <button
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        disabled={paginaActual === 1 || totalPaginas === 0}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                      >
                        <MdChevronLeft size={20} />
                      </button>

                      {/* NÚMEROS DE PÁGINA CON ESTILO 3D */}
                      <div className="flex items-center gap-1.5">
                        {totalPaginas <= 1 ? (
                          <button className="w-9 h-9 rounded-xl text-[11px] font-black bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600 italic">
                            1
                          </button>
                        ) : (
                          [...Array(totalPaginas)]
                            .map((_, i) => {
                              const numero = i + 1
                              const esActiva = paginaActual === numero
                              return (
                                <button
                                  key={numero}
                                  onClick={() => setPaginaActual(numero)}
                                  className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all italic ${
                                    esActiva
                                      ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600'
                                      : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'
                                  }`}
                                >
                                  {numero}
                                </button>
                              )
                            })
                            // Limitamos la vista de números para que no rompa el diseño si hay demasiadas páginas
                            .slice(
                              Math.max(0, paginaActual - 3),
                              Math.min(totalPaginas, paginaActual + 2)
                            )
                        )}
                      </div>

                      {/* Botón Siguiente */}
                      <button
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas || totalPaginas === 0}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
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
