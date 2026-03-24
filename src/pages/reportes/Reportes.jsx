import { useState, useEffect, useMemo } from 'react'
import {
  MdTimeline,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdSearchOff,
  MdBarChart,
  MdAccountBalanceWallet,
  MdAssignmentReturn,
  MdHistory,
  MdErrorOutline,
  MdDateRange,
  MdKeyboardArrowDown,
} from 'react-icons/md'
import { FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa'
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
import { formatFecha } from '../../utils/fromatters'

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

  const [movimientos, setMovimientos] = useState([])
  const [cxc, setCxc] = useState([])
  const [cxp, setCxp] = useState([])
  const [reportes, setReportes] = useState([])
  const [cajas, setCajas] = useState([])
  const [loading, setLoading] = useState(false)
  const [empresa, setEmpresa] = useState(null)

  const [periodoSel, setPeriodoSel] = useState(PERIODOS.MENSUAL)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS')

  // Lógica de fechas reactiva (Original)
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
  }, [periodoSel])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resMov, resCXC, resCXP, resRepor, resEmpresa, resCajas] = await Promise.all([
        movimientoAPI.listarTodos(token),
        cuentasPorCobrarAPI.listarTodas(token),
        cuentasPorPagarAPI.listarTodas(token),
        reporteAPI.listarTodos(token),
        empresaAPI.obtenerInformacion(token),
        cajaAPI.listarTodas(token),
      ])
      setMovimientos(resMov.data.movimientos || [])
      setCxc(resCXC.data.cuentasPorCobrar || [])
      setCxp(resCXP.data.cuentasPorPagar || [])
      setReportes(resRepor.data.reportes || [])
      setEmpresa(resEmpresa.data.empresa || null)
      setCajas(resCajas.data.cajas || [])
    } catch (error) {
      console.error('Error Aroma de Oro:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  useEffect(() => {
    console.log(movimientos)
  }, [movimientos])

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

  // ESTADÍSTICAS MANTENIENDO TU ESTRUCTURA ORIGINAL PERO DINÁMICAS
  const stats = useMemo(() => {
    // 1. CALCULAMOS EL SALDO REAL FÍSICO (Lo que hay en las cajas abiertas actualmente)
    // Esto evita que salga negativo si hoy solo hubo egresos pero tenías dinero de ayer.
    const saldoCajasAbiertas = cajas
      .filter((c) => c.estado === 'Abierta')
      .reduce((acc, c) => acc + parseFloat(c.saldoActual || 0), 0)

    // 2. CALCULAMOS EL FLUJO DE BANCOS/TRANSFERENCIAS DEL PERIODO SELECCIONADO
    const flujoBancos = movimientosFiltrados.reduce((acc, m) => {
      const monto = parseFloat(m.monto || 0)
      const desc = m.descripcion?.toLowerCase() || ''
      const esIngreso = m.tipoMovimiento === 'Ingreso'

      if (desc.includes('transferencia') || desc.includes('depósito') || m.categoria === 'Bancos') {
        return esIngreso ? acc + monto : acc - monto
      }
      return acc
    }, 0)

    // 3. RETORNAMOS TODAS LAS CARDS (Manteniendo tu estructura original de 5 columnas)
    return [
      {
        label: 'Efectivo Real',
        value: saldoCajasAbiertas, // Saldo físico real en el cajón
        icon: <MdAccountBalanceWallet />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        sub: 'Saldo en Caja',
      },
      {
        label: `Bancos (${periodoSel})`,
        value: flujoBancos, // Movimientos bancarios del rango seleccionado
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

  const validacion = useMemo(() => {
    const hayDatos = movimientosFiltrados.length > 0
    return {
      puedeGenerar: hayDatos && fechaInicio && fechaFin,
      errorMsg: !hayDatos ? 'Sin datos en este rango' : null,
    }
  }, [movimientosFiltrados, fechaInicio, fechaFin])

  const handleGenerarPDF = async () => {
    if (!validacion.puedeGenerar) return
    // (Tu lógica de PDF original se mantiene igual)
    Swal.fire({
      title: 'Generando Reporte...',
      text: 'Respaldando en Nube Aroma de Oro',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const margin = 15
      const darkGray = [31, 41, 55]
      const goldColor = [180, 150, 50]

      doc.setFillColor(...darkGray)
      doc.rect(0, 0, 210, 45, 'F')
      doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(255, 255, 255)
      doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margin, 18)

      doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(200, 200, 200)
      doc.text(`RUC: ${empresa?.ruc || 'N/A'}`, margin, 25)
      doc.text(`DIR: ${empresa?.direccion || 'N/A'}`, margin, 30)
      doc.text(
        `TEL: ${empresa?.telefono || 'N/A'} | CORREO: ${empresa?.correo || 'N/A'}`,
        margin,
        35
      )

      const ingTotal = movimientosFiltrados
        .filter((m) => m.tipoMovimiento === 'Ingreso')
        .reduce((a, b) => a + parseFloat(b.monto || 0), 0)
      const egrTotal = movimientosFiltrados
        .filter((m) => m.tipoMovimiento === 'Egreso')
        .reduce((a, b) => a + parseFloat(b.monto || 0), 0)

      autoTable(doc, {
        startY: 55,
        head: [['CONCEPTO OPERATIVO', { content: 'VALOR', styles: { halign: 'right' } }]],
        body: [
          ['(+) INGRESOS REGISTRADOS', `$ ${ingTotal.toFixed(2)}`],
          ['(-) EGRESOS REGISTRADOS', `$ ${egrTotal.toFixed(2)}`],
          [
            '(=) BALANCE DEL PERIODO',
            { content: `$ ${(ingTotal - egrTotal).toFixed(2)}`, styles: { fontStyle: 'bold' } },
          ],
        ],
        theme: 'striped',
        headStyles: { fillColor: goldColor },
        columnStyles: { 1: { halign: 'right' } },
      })

      const rows = movimientosFiltrados.map((m) => [
        new Date(m.fecha).toLocaleDateString('es-EC'),
        m.categoria.toUpperCase(),
        m.tipoMovimiento.toUpperCase(),
        `$ ${parseFloat(m.monto).toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['FECHA', 'CATEGORÍA', 'TIPO', 'MONTO']],
        body: rows,
        headStyles: { fillColor: darkGray },
        styles: { fontSize: 8 },
      })

      const fileName = `Reporte_${Date.now()}.pdf`
      const pdfBlob = doc.output('blob')
      const formData = new FormData()
      formData.append('archivoReporte', pdfBlob, fileName)
      formData.append('nombre', `Reporte ${categoriaFiltro} - ${periodoSel}`)
      formData.append('tipo', 'GENERAL')
      formData.append('fechaRangoInicio', fechaInicio)
      formData.append('fechaRangoFin', fechaFin)
      formData.append('formato', 'PDF')
      formData.append('UsuarioId', user.id)

      await reporteAPI.subirReporte(token, formData)
      doc.save(fileName)
      fetchData()
      Swal.fire('¡Listo!', 'Reporte generado y respaldado', 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Hubo un problema al generar el PDF', 'error')
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER ORIGINAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter italic">
              Reportes Maestros
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
              Aroma de Oro | Análisis de Liquidez
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-gray-900 text-amber-400 px-8 py-4 rounded-2xl text-sm font-black uppercase transition-all shadow-xl active:scale-95"
          >
            <MdBarChart size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Sincronizar'}
          </button>
        </div>

        {/* INDICADORES ORIGINALES (Ahora con lógica dinámica de efectivo/bancos) */}
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
          {/* PANEL CONFIGURACIÓN ORIGINAL */}
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
                      <option value="Ingreso">Ingresos Generales</option>
                      <option value="Egreso">Egresos Generales</option>
                      <option value="Venta">Ventas</option>
                      <option value="Compra">Compras / Suministros</option>
                      <option value="Nomina">Nómina</option>
                      <option value="Prestamo">Préstamos</option>
                      <option value="Anticipo">Anticipos</option>
                      <option value="Gasto">Gastos Varios</option>
                    </select>
                    <MdKeyboardArrowDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={24}
                    />
                  </div>
                </div>

                {!validacion.puedeGenerar && (
                  <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <MdErrorOutline className="text-rose-500 flex-shrink-0" size={20} />
                    <span className="text-[11px] font-black text-rose-600 uppercase leading-tight tracking-wider">
                      {validacion.errorMsg}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleGenerarPDF}
                  disabled={!validacion.puedeGenerar}
                  className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase transition-all shadow-lg ${validacion.puedeGenerar ? 'bg-gray-900 text-amber-400 hover:bg-gray-800 scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <FaFilePdf size={18} /> Exportar y Subir Reporte
                </button>
              </div>
            </div>
          </div>

          {/* PREVISUALIZACIÓN ORIGINAL */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
              <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MdDateRange className="text-gray-400" size={20} />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Previsualización Datos ({periodoSel})
                  </h3>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase ${movimientosFiltrados.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}
                >
                  {movimientosFiltrados.length} Registros
                </span>
              </div>
              {movimientosFiltrados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <MdSearchOff className="text-gray-100" size={120} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest italic">
                    No hay registros en este periodo
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                      {movimientosFiltrados.map((mov) => (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Reportes
