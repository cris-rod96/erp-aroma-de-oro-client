import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarSueldosPDF = async (nominas, periodoSel, empresa) => {
  if (!nominas || nominas.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros de nómina para exportar', 'info')
  }

  try {
    const doc = new jsPDF({ orientation: 'landscape', compress: true })
    const anchoPagina = 297
    const margen = 15

    // --- CABECERA NEGRA (Diseño Aroma de Oro) ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 40, 'F')

    // Título con el Periodo incluido
    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`REPORTE DE NÓMINA - ${periodoSel.toUpperCase()}`, anchoPagina - margen, 15, {
      align: 'right',
    })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 15)

    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`RUC: ${empresa?.ruc || '09XXXXXXXX001'} | SISTEMA DE GESTIÓN`, margen, 22)
    doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleString('es-EC')}`, margen, 27)

    // --- TOTALIZADORES ---
    const totales = nominas.reduce(
      (acc, n) => ({
        base: acc.base + parseFloat(n.detalleNomina.sueldoBase),
        bonos: acc.bonos + parseFloat(n.detalleNomina.bono || 0),
        descGen: acc.descGen + parseFloat(n.detalleNomina.descuentoGeneral || 0),
        descPres: acc.descPres + parseFloat(n.detalleNomina.descuentoPrestamo || 0),
        neto: acc.neto + parseFloat(n.detalleNomina.totalPagar),
      }),
      { base: 0, bonos: 0, descGen: 0, descPres: 0, neto: 0 }
    )

    doc.setFontSize(10).setTextColor(255)
    doc.text(`TOTAL NETO PAGADO: ${formatMoney(totales.neto)}`, anchoPagina - margen, 27, {
      align: 'right',
    })

    // --- TABLA TÉCNICA ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [
        [
          'CÓDIGO',
          'FECHA PAGO',
          'TRABAJADOR',
          'TIPO',
          'S. BASE',
          'UNID.',
          'SUBTOTAL',
          'BONOS',
          'DESC. GEN',
          'DESC. PRÉST.',
          'TOTAL NETO',
        ],
      ],
      body: nominas.map((n) => [
        n.detalleNomina.codigo,
        new Date(n.detalleNomina.createdAt).toLocaleDateString('es-EC'),
        n.detalleNomina.Persona?.nombreCompleto?.toUpperCase() || 'S/N',
        n.detalleNomina.tipoPeriodo?.toUpperCase(),
        formatMoney(n.detalleNomina.sueldoBase),
        n.detalleNomina.unidadesTrabajadas,
        formatMoney(n.detalleNomina.subTotal),
        { content: `+${formatMoney(n.detalleNomina.bono)}`, styles: { textColor: [0, 120, 0] } },
        {
          content: `-${formatMoney(n.detalleNomina.descuentoGeneral)}`,
          styles: { textColor: [150, 0, 0] },
        },
        {
          content: `-${formatMoney(n.detalleNomina.descuentoPrestamo)}`,
          styles: { textColor: [150, 0, 0], fontStyle: 'bold' },
        },
        {
          content: formatMoney(n.detalleNomina.totalPagar),
          styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
        },
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [230, 160, 0],
        textColor: [0, 0, 0],
        fontSize: 8,
        halign: 'center',
        fontStyle: 'bold',
      },
      styles: { fontSize: 7, valign: 'middle', halign: 'center' },
      columnStyles: {
        2: { halign: 'left', cellWidth: 45 },
        10: { halign: 'center' },
      },
      foot: [
        [
          '',
          '',
          'TOTALES GENERALES',
          '',
          formatMoney(totales.base),
          '',
          '',
          `+${formatMoney(totales.bonos)}`,
          `-${formatMoney(totales.descGen)}`,
          `-${formatMoney(totales.descPres)}`,
          formatMoney(totales.neto),
        ],
      ],
      footStyles: { fillColor: [28, 31, 38], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    })

    // --- BLOQUE DE FIRMAS ---
    const finalY = doc.lastAutoTable.finalY + 20
    if (finalY < 190) {
      doc.setDrawColor(150).setLineWidth(0.5)
      doc.line(margen, finalY, margen + 60, finalY)
      doc.line(anchoPagina - margen - 60, finalY, anchoPagina - margen, finalY)

      doc.setFontSize(8).setTextColor(100)
      doc.text('ELABORADO POR (ADMIN)', margen + 30, finalY + 5, { align: 'center' })
      doc.text('REVISADO / GERENCIA', anchoPagina - margen - 30, finalY + 5, { align: 'center' })
    }

    // CORRECCIÓN: Quitamos el n.codigo que no existe aquí y usamos el periodoSel
    doc.save(`NOMINA_${periodoSel.toUpperCase()}_${new Date().getTime()}.pdf`)

    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo generar el reporte de nómina detallado', 'error')
  }
}
