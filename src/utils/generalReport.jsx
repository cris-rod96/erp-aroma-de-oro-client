import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

export const exportarReporteGeneralPDF = async (movimientos, cajas, periodoSel, empresa) => {
  if (!movimientos || movimientos.length === 0) return

  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const anchoPagina = 210
    const margen = 15

    // 1. LÓGICA DE FECHAS Y MESES
    const meses = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ]
    const fechaActual = new Date()
    const mesActual = meses[fechaActual.getMonth()]
    const anioActual = fechaActual.getFullYear()

    let tituloPeriodo = periodoSel.toUpperCase()
    let nombreArchivo = `REPORTE_GENERAL_${periodoSel.toUpperCase()}_${anioActual}.pdf`

    if (periodoSel.toUpperCase() === 'MENSUAL') {
      tituloPeriodo = `MES DE ${mesActual} ${anioActual}`
      nombreArchivo = `REPORTE_CAJA_${mesActual}_${anioActual}.pdf`
    }

    // 2. CÁLCULOS FINANCIEROS
    const montoCajasCerradas = cajas.reduce((acc, c) => acc + parseFloat(c.montoCierre || 0), 0)
    let ingresosPeriodo = 0
    let egresosPeriodo = 0

    const movsOrdenados = [...movimientos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

    const bodyTabla = movsOrdenados.map((m) => {
      let ingreso = 0
      let egreso = 0
      const valorMonto = parseFloat(m.monto || 0)
      const esCruce = m.categoria === 'Cobro Anticipo' || m.CajaId === null
      const desc = (m.descripcion || m.categoria).toUpperCase()

      if (m.tipoMovimiento === 'Ingreso') {
        ingreso = valorMonto
        if (!esCruce) ingresosPeriodo += valorMonto
      } else {
        egreso = valorMonto
        egresosPeriodo += valorMonto
      }

      return [
        { content: new Date(m.fecha).toLocaleDateString('es-EC'), styles: { halign: 'center' } },
        esCruce ? `${desc} (CRUCE CONTABLE)` : desc,
        {
          content: ingreso > 0 ? `$${ingreso.toFixed(2)}` : '',
          styles: { halign: 'right', textColor: esCruce ? [120, 120, 120] : [34, 139, 34] },
        },
        {
          content: egreso > 0 ? `$${egreso.toFixed(2)}` : '',
          styles: { halign: 'right', textColor: [178, 34, 34] },
        },
      ]
    })

    const totalNeto = montoCajasCerradas + ingresosPeriodo - egresosPeriodo

    // --- CABECERA ---
    doc.setFillColor(28, 31, 38).rect(0, 0, anchoPagina, 40, 'F')
    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`REPORTE GENERAL DE CAJA`, anchoPagina - margen, 18, { align: 'right' })
    doc
      .setFontSize(14)
      .setTextColor(230, 160, 0)
      .text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)
    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`PERIODO: ${tituloPeriodo}`, margen, 25)
    doc.text(`FECHA DE EMISIÓN: ${fechaActual.toLocaleDateString('es-EC')}`, margen, 30)

    // --- TABLA 1: DETALLE DE MOVIMIENTOS ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'DETALLE DEL MOVIMIENTO', 'INGRESOS', 'EGRESOS']],
      body: bodyTabla,
      theme: 'grid',
      headStyles: { fillColor: [230, 160, 0], textColor: 0, fontSize: 8, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 32 },
        3: { cellWidth: 32 },
      },
    })

    // --- TABLA 2: RESUMEN FINANCIERO TOTAL ---
    const finalYTabla1 = doc.lastAutoTable.finalY + 8

    autoTable(doc, {
      startY: finalYTabla1,
      margin: { left: margen, right: margen },
      head: [
        [
          {
            content: 'RESUMEN FINANCIERO TOTAL',
            colSpan: 2,
            styles: { halign: 'center', fillColor: [28, 31, 38] },
          },
        ],
      ],
      body: [
        [
          '(+) SALDO INICIAL (MONTO CIERRE CAJAS)',
          { content: `$${montoCajasCerradas.toFixed(2)}`, styles: { halign: 'right' } },
        ],
        [
          '(+) TOTAL INGRESOS DEL PERIODO',
          { content: `$${ingresosPeriodo.toFixed(2)}`, styles: { halign: 'right' } },
        ],
        [
          '(-) TOTAL EGRESOS DEL PERIODO',
          { content: `$${egresosPeriodo.toFixed(2)}`, styles: { halign: 'right' } },
        ],
        [
          {
            content: 'TOTAL NETO',
            styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
          },
          {
            content: `$${totalNeto.toFixed(2)}`,
            styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' },
          },
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 40 } },
    })

    // --- FIRMAS ---
    const finalYFirmas = doc.lastAutoTable.finalY + 30
    doc.setDrawColor(180).line(margen, finalYFirmas, margen + 60, finalYFirmas)
    doc.line(anchoPagina - margen - 60, finalYFirmas, anchoPagina - margen, finalYFirmas)
    doc
      .setFontSize(8)
      .setTextColor(100)
      .text('RESPONSABLE DE CAJA', margen + 30, finalYFirmas + 5, { align: 'center' })
    doc.text('CONTABILIDAD / GERENCIA', anchoPagina - margen - 30, finalYFirmas + 5, {
      align: 'center',
    })

    doc.save(nombreArchivo)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al generar el reporte', 'error')
  }
}
