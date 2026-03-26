import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarGastosPDF = async (gastos, periodoSel, empresa) => {
  if (!gastos || gastos.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros de gastos para exportar', 'info')
  }

  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const anchoPagina = 210
    const largoPagina = 297 // Altura A4
    const margen = 15

    // --- LÓGICA DE RANGO DE FECHAS (UNIFICADA) ---
    const fechaHasta = new Date()
    const fechaDesde = new Date()
    switch (periodoSel.toUpperCase()) {
      case 'DIARIO':
        fechaDesde.setHours(0, 0, 0, 0)
        break
      case 'SEMANAL':
        fechaDesde.setDate(fechaHasta.getDate() - 7)
        break
      case 'MENSUAL':
        fechaDesde.setMonth(fechaHasta.getMonth() - 1)
        break
      case 'TRIMESTRAL':
        fechaDesde.setMonth(fechaHasta.getMonth() - 3)
        break
      case 'ANUAL':
        fechaDesde.setFullYear(fechaHasta.getFullYear() - 1)
        break
      default:
        fechaDesde.setFullYear(2020, 0, 1)
        break
    }
    const rangoFechas = `${fechaDesde.toLocaleDateString('es-EC')} - ${fechaHasta.toLocaleDateString('es-EC')}`

    // --- CABECERA MAESTRA (IDÉNTICA EN TODOS LOS REPORTES) ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 40, 'F') // Fondo oscuro

    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`REPORTE DE GASTOS`, anchoPagina - margen, 18, { align: 'right' })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)

    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`RUC: ${empresa?.ruc || '1234567890123'} | CONTROL OPERATIVO`, margen, 25)
    doc.text(`PERIODO: ${rangoFechas}`, margen, 30)

    doc.setFontSize(10).setTextColor(255).setFont('helvetica', 'bold')
    const totalMonto = gastos.reduce((acc, g) => acc + parseFloat(g.detalleGasto?.monto || 0), 0)
    doc.text(`TOTAL EGRESOS: ${formatMoney(totalMonto)}`, anchoPagina - margen, 30, {
      align: 'right',
    })

    // --- TABLA DE DATOS ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'CATEGORÍA', 'MOTIVO / DESCRIPCIÓN', 'MONTO']],
      body: gastos.map((g) => {
        const d = g.detalleGasto || {}
        return [
          {
            content: new Date(d.createdAt || g.fecha).toLocaleDateString('es-EC'),
            styles: { halign: 'center' },
          },
          { content: d.categoria?.toUpperCase() || 'GENERAL', styles: { fontStyle: 'bold' } },
          d.descripcion?.toUpperCase() || 'SIN DETALLE ESPECÍFICO',
          { content: formatMoney(d.monto), styles: { halign: 'right', fontStyle: 'bold' } },
        ]
      }),
      theme: 'grid',
      headStyles: {
        fillColor: [230, 160, 0],
        textColor: 0,
        fontSize: 9,
        halign: 'center',
        fontStyle: 'bold',
      },
      styles: { fontSize: 8, valign: 'middle' },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 }, 3: { cellWidth: 30 } },
      foot: [
        [
          '',
          '',
          { content: 'RESUMEN TOTAL', styles: { halign: 'right' } },
          { content: formatMoney(totalMonto), styles: { halign: 'right' } },
        ],
      ],
      footStyles: { fillColor: [28, 31, 38], textColor: 255 },
    })

    // --- BLOQUE DE FIRMAS AL FINAL DE LA HOJA ---
    // Usamos el largo de la página menos un margen inferior fijo (ej: 40mm)
    const posicionFirmasY = largoPagina - 40

    doc.setDrawColor(180).setLineWidth(0.5)
    // Línea Izquierda
    doc.line(margen, posicionFirmasY, margen + 60, posicionFirmasY)
    // Línea Derecha
    doc.line(anchoPagina - margen - 60, posicionFirmasY, anchoPagina - margen, posicionFirmasY)

    doc.setFontSize(8).setTextColor(100).setFont('helvetica', 'bold')
    doc.text('RESPONSABLE DE CAJA', margen + 30, posicionFirmasY + 5, { align: 'center' })
    doc.text('GERENCIA / AUTORIZADO', anchoPagina - margen - 30, posicionFirmasY + 5, {
      align: 'center',
    })

    // Pie de página con numeración y fecha de impresión
    doc.setFontSize(7).setTextColor(150)
    doc.text(`Impreso el: ${new Date().toLocaleString('es-EC')}`, margen, largoPagina - 10)
    doc.text(`Página 1`, anchoPagina - margen, largoPagina - 10, { align: 'right' })

    doc.save(`GASTOS_${periodoSel.toUpperCase()}_${new Date().getTime()}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo generar el reporte', 'error')
  }
}
