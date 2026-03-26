import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

export const exportarAnticiposPDF = async (anticipos, periodoSel, empresa) => {
  if (!anticipos || anticipos.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros de anticipos para exportar', 'info')
  }

  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const anchoPagina = 210
    const margen = 15

    // 1. NOMBRE DE ARCHIVO DINÁMICO
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
    let labelPeriodo = periodoSel.toUpperCase()

    if (periodoSel.toUpperCase() === 'MENSUAL') labelPeriodo = meses[fechaActual.getMonth()]
    const nombreArchivo = `ANTICIPOS_AROMA_DE_ORO_${labelPeriodo}.pdf`

    // --- CABECERA ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 40, 'F')

    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`REPORTE DE ANTICIPOS`, anchoPagina - margen, 18, { align: 'right' })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)

    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`RUC: ${empresa?.ruc || '1234567890123'} | GESTIÓN DE CRÉDITOS`, margen, 25)
    doc.text(`EMITIDO: ${fechaActual.toLocaleDateString('es-EC')}`, margen, 30)

    // --- PROCESAMIENTO DE DATOS ---
    let totalAnticipado = 0
    let totalSaldado = 0

    const dataTabla = anticipos.map((a) => {
      const monto = parseFloat(a.monto || 0)
      const saldo = parseFloat(a.saldo || 0)
      const aplicado = monto - saldo
      const motivo = (a.detalleAnticipo?.comentario || 'SIN MOTIVO').toUpperCase()

      totalAnticipado += monto
      totalSaldado += saldo

      return [
        { content: new Date(a.fecha).toLocaleDateString('es-EC'), styles: { halign: 'center' } },
        (a.detalleAnticipo?.Persona?.nombreCompleto || 'CLIENTE GENERAL').toUpperCase(),
        motivo,
        { content: `$${monto.toFixed(2)}`, styles: { halign: 'right' } },
        {
          content: `$${aplicado.toFixed(2)}`,
          styles: { halign: 'right', textColor: [0, 102, 204] },
        },
        {
          content: `$${saldo.toFixed(2)}`,
          styles: {
            halign: 'right',
            fontStyle: 'bold',
            fillColor: saldo > 0 ? [255, 245, 230] : [240, 240, 240],
          },
        },
      ]
    })

    // --- TABLA PRINCIPAL ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'BENEFICIARIO', 'MOTIVO', 'MONTO', 'APLICADO', 'SALDO PEND.']],
      body: dataTabla,
      theme: 'grid',
      headStyles: { fillColor: [230, 160, 0], textColor: 0, fontSize: 8, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' }, // El motivo toma el espacio flexible
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    })

    // --- RESUMEN FINAL ---
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFillColor(28, 31, 38)
    doc.rect(margen, finalY, anchoPagina - margen * 2, 10, 'F')

    doc.setFontSize(9).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`TOTAL ANTICIPOS: $${totalAnticipado.toFixed(2)}`, margen + 5, finalY + 6.5)
    doc.text(
      `TOTAL PENDIENTE: $${totalSaldado.toFixed(2)}`,
      anchoPagina - margen - 5,
      finalY + 6.5,
      { align: 'right' }
    )

    // --- FIRMAS ---
    const posicionFirmasY = 265
    doc.setDrawColor(180).setLineWidth(0.5)
    doc.line(margen, posicionFirmasY, margen + 60, posicionFirmasY)
    doc.line(anchoPagina - margen - 60, posicionFirmasY, anchoPagina - margen, posicionFirmasY)

    doc.setFontSize(8).setTextColor(100).setFont('helvetica', 'bold')
    doc.text('RESPONSABLE DE CAJA', margen + 30, posicionFirmasY + 5, { align: 'center' })
    doc.text('AUTORIZADO POR', anchoPagina - margen - 30, posicionFirmasY + 5, { align: 'center' })

    doc.save(nombreArchivo)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo generar el reporte de anticipos', 'error')
  }
}
