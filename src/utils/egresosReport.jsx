import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from '../utils/fromatters'

export const exportarEgresosPDF = async (data, filtroTiempo, empresa) => {
  if (data.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros de egresos para generar el reporte', 'info')
  }

  Swal.fire({
    title: 'GENERANDO REPORTE',
    text: `Procesando auditoría de egresos Aroma de Oro...`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    const doc = new jsPDF({ compress: true })
    const anchoPagina = 210
    const margen = 15
    const ejeDerecho = anchoPagina - margen

    // --- 1. LÓGICA DE PERIODOS (DESDE HOY HACIA ATRÁS) ---
    const fechaFin = new Date()
    const fechaInicio = new Date()

    switch (filtroTiempo.toUpperCase()) {
      case 'DIARIO':
        fechaInicio.setHours(0, 0, 0, 0)
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
        fechaInicio.setMonth(fechaFin.getMonth() - 1)
    }

    const fInicioStr = fechaInicio.toLocaleDateString('es-EC')
    const fFinStr = fechaFin.toLocaleDateString('es-EC')

    // --- 2. PROCESAMIENTO DE DATOS ---
    let totalEgresos = 0
    const filasDetail = []

    // Filtramos solo Egresos y ordenamos por fecha descendente
    const soloEgresos = data
      .filter((m) => m.tipoMovimiento === 'Egreso')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    soloEgresos.forEach((m) => {
      const monto = parseFloat(m.monto || 0)
      totalEgresos += monto

      const fechaMov = new Date(m.fecha).toLocaleString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      filasDetail.push([
        fechaMov,
        (m.categoria || 'EGRESO').toUpperCase(),
        (m.metodoPago || 'EFECTIVO').toUpperCase(),
        doc.splitTextToSize((m.descripcion || 'GASTO OPERATIVO').toUpperCase(), 80),
        {
          content: `-${formatMoney(monto)}`,
          styles: { textColor: [150, 0, 0], fontStyle: 'bold' },
        },
      ])
    })

    // --- 3. CABECERA ALINEADA ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 45, 'F')

    // Título y Empresa (Y=18 para alineación de techos)
    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text('REPORTE DE EGRESOS', ejeDerecho, 18, { align: 'right' })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)

    // Subtítulos
    doc.setFontSize(8).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(
      `RUC: ${empresa?.ruc || '1234567890123'} | DIR: ${empresa?.direccion || 'Guayas, El Empalme'}`,
      margen,
      25
    )
    doc.text(`CORTE: DESDE EL ${fInicioStr} HASTA EL ${fFinStr}`, margen, 29)

    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`MODO: ${filtroTiempo.toUpperCase()}`, ejeDerecho, 25, { align: 'right' })

    // Total resaltado en rojo suave o naranja
    doc.setFontSize(11).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(`TOTAL EGRESOS: ${formatMoney(totalEgresos)}`, ejeDerecho, 33, { align: 'right' })

    // --- 4. TABLA RESUMEN ---
    autoTable(doc, {
      startY: 50,
      margin: { left: margen, right: margen },
      body: [
        [
          {
            content: 'TOTAL SALIDA DE CAPITAL (FLUJO EFECTIVO)',
            styles: { fontStyle: 'bold', fillColor: [44, 62, 80], textColor: 255 },
          },
          {
            content: formatMoney(totalEgresos),
            styles: { fontStyle: 'bold', fillColor: [44, 62, 80], textColor: 255, halign: 'right' },
          },
        ],
      ],
      theme: 'grid',
    })

    // --- 5. DETALLE DE MOVIMIENTOS ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'RUBRO', 'MÉTODO', 'CONCEPTO', 'VALOR']],
      body: filasDetail,
      theme: 'grid',
      headStyles: { fillColor: [28, 31, 38], halign: 'center', fontSize: 8 },
      styles: { fontSize: 7, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 30 },
        2: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 30 },
      },
    })

    doc.save(`EGRESOS_AROMA_ORO_${Date.now().toString().slice(-4)}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Fallo al generar reporte de egresos.', 'error')
  }
}
