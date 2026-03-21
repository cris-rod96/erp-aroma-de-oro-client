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
  MdCloudUpload,
  MdHistory,
  MdErrorOutline,
  MdDateRange,
  MdKeyboardArrowDown,
} from 'react-icons/md'
import { FaFilePdf, FaFileExcel, FaExternalLinkAlt } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import {
  cuentasPorCobrarAPI,
  cuentasPorPagarAPI,
  empresaAPI,
  movimientoAPI,
  reporteAPI,
} from '../../api/index.api'

import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatFecha } from '../../utils/fromatters'
import { useCajaStore } from '../../store/useCajaStore'

const PERIODOS = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
}

const Reportes = () => {
  const token = useAuthStore((store) => store.token)

  const [movimientos, setMovimientos] = useState([])
  const [cxc, setCxc] = useState([])
  const [cxp, setCxp] = useState([])
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [empresa, setEmpresa] = useState(null)

  const [periodoSel, setPeriodoSel] = useState(PERIODOS.MENSUAL)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS') // <--- ESTE ES TU ESTADO

  const user = useAuthStore((store) => store.adminData)
  const caja = useCajaStore((store) => store.caja)

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
      default:
        break
    }
    setFechaInicio(inicio.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
  }, [periodoSel])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resMov, resCXC, resCXP, resRepor, resEmpresa] = await Promise.all([
        movimientoAPI.listarTodos(token),
        cuentasPorCobrarAPI.listarTodas(token),
        cuentasPorPagarAPI.listarTodas(token),
        reporteAPI.listarTodos(token),
        empresaAPI.obtenerInformacion(token),
      ])
      setMovimientos(resMov.data.movimientos || [])
      setCxc(resCXC.data.cuentas || [])
      setCxp(resCXP.data.cuentas || [])
      setReportes(resRepor.data.reportes || [])
      setEmpresa(resEmpresa.data.empresa)
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

  const validacion = useMemo(() => {
    const hayDatos = movimientosFiltrados.length > 0
    return {
      puedeGenerar: hayDatos && fechaInicio && fechaFin,
      errorMsg: !hayDatos ? 'Sin datos para este rango' : null,
    }
  }, [movimientosFiltrados, fechaInicio, fechaFin])

  const stats = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipoMovimiento === 'Ingreso')
      .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)
    const egresos = movimientos
      .filter((m) => m.tipoMovimiento === 'Egreso')
      .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)
    return [
      {
        label: 'Saldo en Caja',
        value: caja.saldoActual,
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
        value: cxc
          .filter((c) => c.estado === 'Pendiente')
          .reduce((acc, curr) => acc + parseFloat(curr.montoPorCobrar), 0),
        icon: <MdTimeline />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        sub: 'Cartera',
      },
      {
        label: 'Por Pagar',
        value: cxp
          .filter((p) => p.estado === 'Pendiente')
          .reduce((acc, curr) => acc + parseFloat(curr.saldoPendiente || curr.montoPorPagar), 0),
        icon: <MdAssignmentReturn />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        sub: 'Deudas',
      },
    ]
  }, [movimientos, cxc, cxp])

  // --- MÉTODO GENERAR PDF CORREGIDO ---
  const handleGenerarPDF = async () => {
    if (!movimientosFiltrados || movimientosFiltrados.length === 0) {
      Swal.fire('Cuidado', 'No hay datos para generar el reporte', 'warning')
      return
    }

    Swal.fire({
      title: 'Generando Reporte...',
      text: 'Respaldando en la nube de Aroma de Oro',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const margin = 15
      const logoGold = [180, 150, 50]
      const darkGray = [31, 41, 55]

      // --- ENCABEZADO ---
      doc.setFillColor(...darkGray)
      doc.rect(0, 0, 210, 45, 'F')
      doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(255, 255, 255)
      doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margin, 18)

      doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(200, 200, 200)
      doc.text(`RUC: ${empresa?.ruc || 'N/A'}`, margin, 25)
      doc.text(`DIR: ${empresa?.direccion || 'N/A'}`, margin, 30)
      doc.text(
        `TEL: ${empresa?.telefono || 'N/A'} | EMAIL: ${empresa?.correo || 'N/A'}`,
        margin,
        35
      )

      doc.setFillColor(60, 70, 85).roundedRect(140, 10, 55, 25, 3, 3, 'F')
      doc.setTextColor(255, 255, 255).setFontSize(8)
      doc.text(`REPORTE: ${periodoSel.toUpperCase()}`, 145, 18)
      doc.text(`DESDE: ${fechaInicio}`, 145, 24)
      doc.text(`HASTA: ${fechaFin}`, 145, 30)

      // --- RESUMEN ---
      let yPos = 55
      doc
        .setTextColor(...darkGray)
        .setFontSize(11)
        .setFont('helvetica', 'bold')
      doc.text('RESUMEN DE LIQUIDEZ (CAJA)', margin, yPos)

      const ingresos = movimientosFiltrados
        .filter((m) => m.tipoMovimiento === 'Ingreso')
        .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)
      const egresos = movimientosFiltrados
        .filter((m) => m.tipoMovimiento === 'Egreso')
        .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

      autoTable(doc, {
        startY: yPos + 4,
        head: [['DESCRIPCIÓN', { content: 'VALOR ACUMULADO', styles: { halign: 'right' } }]],
        body: [
          [
            '(+) TOTAL INGRESOS',
            {
              content: `$ ${ingresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              styles: { halign: 'right' },
            },
          ],
          [
            '(-) TOTAL EGRESOS',
            {
              content: `$ ${egresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              styles: { halign: 'right' },
            },
          ],
          [
            '(=) FLUJO NETO',
            {
              content: `$ ${(ingresos - egresos).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              styles: { halign: 'right', fontStyle: 'bold' },
            },
          ],
        ],
        theme: 'striped',
        headStyles: { fillColor: logoGold },
        styles: { fontSize: 9, cellPadding: 3 },
      })

      // --- TABLA DETALLE ---
      yPos = doc.lastAutoTable.finalY + 12
      doc
        .setFontSize(11)
        .setTextColor(...darkGray)
        .text('DETALLE DE TRANSACCIONES', margin, yPos)

      const tableRows = movimientosFiltrados.map((m) => {
        let beneficiario = 'VARIOS / GENERAL'
        if (m.categoria === 'Nomina' && m.detalleNomina?.Persona)
          beneficiario = m.detalleNomina.Persona.nombreCompleto
        else if (m.tipoMovimiento === 'Ingreso' && m.detalleVenta?.Comprador)
          beneficiario = m.detalleVenta.Comprador.nombreCompleto
        else if (m.tipoMovimiento === 'Egreso' && m.detalleCompra?.Productor)
          beneficiario = m.detalleCompra.Productor.nombreCompleto

        return [
          new Date(m.fecha).toLocaleDateString('es-EC'),
          m.categoria.toUpperCase(),
          beneficiario.toUpperCase(),
          m.tipoMovimiento.toUpperCase(),
          {
            content: `$ ${parseFloat(m.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
        ]
      })

      autoTable(doc, {
        startY: yPos + 4,
        head: [
          [
            'FECHA',
            'CATEGORÍA',
            'BENEFICIARIO',
            'TIPO',
            { content: 'MONTO', styles: { halign: 'right' } },
          ],
        ],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: darkGray },
        styles: { fontSize: 7.5, valign: 'middle' },
        margin: { left: margin, right: margin },
      })

      // --- MAPEO DE TIPO SEGÚN TU MODELO ENUM ---
      // Valores permitidos: ['CAJA', 'VENTAS', 'COMPRAS', 'INVENTARIO', 'GENERAL', 'NOMINA']
      const mapaTipos = {
        TODOS: 'GENERAL',
        Ingreso: 'CAJA',
        Egreso: 'CAJA',
        Venta: 'VENTAS',
        Compra: 'COMPRAS',
        Nomina: 'NOMINA',
      }

      const tipoEnum = mapaTipos[categoriaFiltro] || 'GENERAL'
      const nombreEmpresaLimpio = (empresa?.nombre || 'AROMA_ORO').replace(/\s+/g, '_')
      const fileName = `Reporte_${tipoEnum}_${nombreEmpresaLimpio}_${Date.now()}.pdf`

      // --- SUBIDA ---
      const pdfBlob = doc.output('blob')
      const formData = new FormData()

      formData.append('archivoReporte', pdfBlob, fileName)
      formData.append('nombre', `Reporte ${tipoEnum} - ${periodoSel}`)
      formData.append('tipo', tipoEnum) // <--- USA EL ENUM CORRECTO
      formData.append('fechaRangoInicio', fechaInicio)
      formData.append('fechaRangoFin', fechaFin)
      formData.append('formato', 'PDF')
      formData.append('UsuarioId', user.id)

      const response = await reporteAPI.subirReporte(token, formData)

      if (response.data) {
        doc.save(fileName)
        await fetchData() // Refresca historial
        Swal.fire('¡Éxito!', 'Reporte guardado en la nube', 'success')
      }
    } catch (error) {
      console.error('Error en GenerarPDF:', error)
      Swal.fire('Error', 'No se pudo subir el reporte', 'error')
    }
  }

  // ... EL RESTO DEL COMPONENTE SE MANTIENE IGUAL ...
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
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <MdBarChart size={20} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {/* KPIs */}
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
                  Configurar Reporte
                </h2>
              </div>

              <div className="space-y-8">
                {/* SELECTOR DE PERIODOS */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Frecuencia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(PERIODOS).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriodoSel(p)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 
                          ${periodoSel === p ? 'bg-amber-400 border-amber-500 text-gray-900 shadow-md scale-105 z-10' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FECHAS DINÁMICAS (Solo Lectura) */}
                <div className="grid grid-cols-2 gap-3 opacity-60">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Desde
                    </label>
                    <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
                      <input
                        type="date"
                        value={fechaInicio}
                        disabled
                        className="bg-transparent w-full outline-none text-[11px] font-bold text-gray-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Hasta
                    </label>
                    <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
                      <input
                        type="date"
                        value={fechaFin}
                        disabled
                        className="bg-transparent w-full outline-none text-[11px] font-bold text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* SELECTOR DE CATEGORÍA */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Filtrar por Categoría
                  </label>
                  <div className="relative group">
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="w-full h-14 bg-gray-100 border-2 border-transparent group-hover:border-amber-400 rounded-2xl px-6 text-xs font-black uppercase text-gray-800 outline-none cursor-pointer appearance-none transition-all"
                    >
                      <option value="TODOS">Todas las categorías</option>
                      <option value="Ingreso">Ingresos Generales</option>
                      <option value="Egreso">Egresos Generales</option>
                      <option value="Venta">Ventas (Maíz/Cacao)</option>
                      <option value="Compra">Insumos/Compras</option>
                      <option value="Nomina">Nómina</option>
                    </select>
                    <MdKeyboardArrowDown
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-500 pointer-events-none transition-colors"
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

                {/* BOTÓN GENERAR */}
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-[11px] font-black uppercase hover:border-red-500 transition-all"
                      onClick={handleGenerarPDF}
                    >
                      <FaFilePdf className="text-red-500" /> GENERAR PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA PREVISUALIZACIÓN */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MdDateRange className="text-gray-400" size={20} />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Previsualización: {periodoSel}
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
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest">
                    Sin movimientos
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

        {/* HISTORIAL ACTUALIZADO CON TU ESTILO */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8 border-l-4 border-gray-900 pl-5">
            <MdHistory size={32} className="text-gray-900" />
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Archivo de Nube
            </h2>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
            {reportes.length === 0 ? (
              <div className="py-24 flex flex-col items-center">
                <MdSearchOff size={60} className="text-gray-200" />
                <p className="text-gray-400 text-xs font-black uppercase mt-6 tracking-widest">
                  Historial vacío
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-900 text-amber-400 text-xs font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6 text-left">Reporte</th>
                      <th className="px-8 py-6 text-center">Formato</th>
                      <th className="px-8 py-6 text-center">Periodo</th>
                      <th className="px-8 py-6 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 uppercase text-[13px] font-bold">
                    {reportes.map((rep) => (
                      <tr key={rep.id} className="hover:bg-amber-50/40">
                        <td className="px-8 py-6 font-black text-gray-800">{rep.nombre}</td>
                        <td className="px-8 py-6 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${rep.formato === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                          >
                            {rep.formato}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-[13px]">
                            <span className="font-semibold text-gray-800 tabular-nums">
                              {formatFecha(rep.fechaRangoInicio)}
                            </span>
                            <span className="text-gray-400 font-light">—</span>
                            <span className="font-semibold text-gray-800 tabular-nums">
                              {formatFecha(rep.fechaRangoFin)}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <a
                            href={rep.url}
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
