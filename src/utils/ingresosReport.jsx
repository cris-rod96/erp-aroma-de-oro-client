import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from '../utils/fromatters'

export const exportarIngresosPDF = async (data, filtroTiempo, empresa) => {
  if (data.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros para generar el reporte', 'info')
  }

  Swal.fire({
    title: 'GENERANDO REPORTE',
    text: `Procesando periodo ${filtroTiempo.toLowerCase()}...`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    const doc = new jsPDF({ compress: true })
    const anchoPagina = 210
    const margen = 15
    const ejeDerecho = anchoPagina - margen

    // --- 1. LÓGICA DE PERIODOS DINÁMICOS (DESDE HOY HACIA ATRÁS) ---
    const fechaFin = new Date()
    const fechaInicio = new Date()

    switch (filtroTiempo.toUpperCase()) {
      case 'DIARIO':
        fechaInicio.setDate(fechaFin.getDate() - 1)
        break
      case 'SEMANAL':
        fechaInicio.setDate(fechaFin.getDate() - 7)
        break
      case 'MENSUAL':
        fechaInicio.setMonth(fechaFin.getMonth() - 1)
        break
      case 'TRIMESTRAL':
        fechaInicio.setMonth(fechaFin.getMonth() - 3)
        break
      case 'ANUAL':
        fechaInicio.setFullYear(fechaFin.getFullYear() - 1)
        break
      default:
        fechaInicio.setMonth(fechaFin.getMonth() - 1) // Default Mensual
    }

    const fInicioStr = fechaInicio.toLocaleDateString('es-EC')
    const fFinStr = fechaFin.toLocaleDateString('es-EC')

    // --- 2. CÁLCULOS DE MONTOS ---
    const resumen = { efIn: 0, admIn: 0 }
    const filasDetail = []

    const todosLosIngresos = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    todosLosIngresos.forEach((m) => {
      const monto = parseFloat(m.monto || 0)
      const esAnticipo = m.categoria?.toUpperCase() === 'COBRO ANTICIPO'

      if (!esAnticipo) resumen.efIn += monto
      else resumen.admIn += monto

      const fechaMov = new Date(m.fecha).toLocaleString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      filasDetail.push([
        fechaMov,
        m.categoria.toUpperCase(),
        esAnticipo ? 'CONTABLE' : 'EFECTIVO',
        doc.splitTextToSize((m.descripcion || 'INGRESO OPERATIVO').toUpperCase(), 75),
        {
          content: `+${formatMoney(monto)}`,
          styles: { textColor: esAnticipo ? [100, 100, 100] : [0, 100, 0], fontStyle: 'bold' },
        },
      ])
    })

    // --- 3. CABECERA (SUBIDA Y ALINEADA) ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 45, 'F')

    // Título y Empresa alineados arriba (Y=18)
    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text('REPORTE DE INGRESOS', ejeDerecho, 18, { align: 'right' })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)

    // Subtítulos Izquierda
    doc.setFontSize(8).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(
      `RUC: ${empresa?.ruc || '1234567890123'} | DIR: ${empresa?.direccion || 'Guayas, El Empalme'}`,
      margen,
      25
    )
    doc.text(`CORTE: DESDE EL ${fInicioStr} HASTA EL ${fFinStr}`, margen, 29)

    // Subtítulos Derecha
    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`MODO: ${filtroTiempo.toUpperCase()}`, ejeDerecho, 25, { align: 'right' })

    doc.setFontSize(11).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(`EFECTIVO REAL: ${formatMoney(resumen.efIn)}`, ejeDerecho, 33, { align: 'right' })

    // --- 4. TABLA DE ARQUEO ---
    autoTable(doc, {
      startY: 50,
      margin: { left: margen, right: margen },
      head: [['DESCRIPCIÓN DE AUDITORÍA DE INGRESOS', 'VALORES']],
      body: [
        ['(+) TOTAL INGRESOS EFECTIVO', formatMoney(resumen.efIn)],
        ['(+) TOTAL COBROS ANTICIPOS (ADMS)', formatMoney(resumen.admIn)],
        [
          {
            content: 'TOTAL RECAUDADO EN CAJA (EFECTIVO)',
            styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
          },
          {
            content: formatMoney(resumen.efIn),
            styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
          },
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: { 1: { halign: 'right', cellWidth: 40 } },
    })

    // --- 5. RESUMEN ADMINISTRATIVO ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      margin: { left: margen, right: margen },
      head: [['RESUMEN DE MOVIMIENTOS ADMINISTRATIVOS', 'VALOR']],
      body: [['COBROS DE ANTICIPOS (SIN FLUJO DE CAJA)', formatMoney(resumen.admIn)]],
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: { 1: { halign: 'right', cellWidth: 40 } },
    })

    // --- 6. DETALLE ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'CATEGORÍA', 'MÉTODO', 'DETALLE', 'VALOR']],
      body: filasDetail,
      theme: 'grid',
      headStyles: { fillColor: [28, 31, 38], halign: 'center', fontSize: 8 },
      styles: { fontSize: 7, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 28 },
        2: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 30 },
      },
    })

    doc.save(`INGRESOS_AROMA_ORO_${Date.now().toString().slice(-4)}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Fallo al procesar el reporte.', 'error')
  }
}
