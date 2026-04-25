import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarPrestamosPDF = async (prestamos, periodoSel, empresa) => {
  if (!prestamos || prestamos.length === 0) {
    return Swal.fire('Sin datos', 'No hay registros de préstamos para exportar', 'info')
  }

  try {
    const doc = new jsPDF({ orientation: 'landscape', compress: true })
    const anchoPagina = 297
    const margen = 15

    // --- LÓGICA DE RANGO DE FECHAS ---
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
        // Si es "TODOS" o no coincide, podemos poner una fecha muy antigua o dejar solo la actual
        fechaDesde.setFullYear(2020, 0, 1)
        break
    }

    const rangoFechas = `${fechaDesde.toLocaleDateString('es-EC')} - ${fechaHasta.toLocaleDateString('es-EC')}`

    // --- CABECERA ESTILO CORPORATIVO AROMA DE ORO ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 40, 'F')

    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`PRÉSTAMOS Y SALDOS - ${periodoSel.toUpperCase()}`, anchoPagina - margen, 15, {
      align: 'right',
    })

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 15)

    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`RUC: ${empresa?.ruc || '09XXXXXXXX001'} | CARTERA DE EMPLEADOS`, margen, 22)

    // Insertamos el rango de fechas calculado
    doc.setFontSize(10).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text(`PERIODO: ${rangoFechas}`, margen, 28)

    doc.setFontSize(8).setTextColor(255).setFont('helvetica', 'normal')
    doc.text(`EMISIÓN: ${new Date().toLocaleString('es-EC')}`, anchoPagina - margen, 34, {
      align: 'right',
    })

    // --- CÁLCULOS DE TOTALES ---
    const totales = prestamos.reduce(
      (acc, p) => {
        const monto = parseFloat(p.detallePrestamo?.montoTotal || 0)
        const saldo = parseFloat(p.detallePrestamo?.saldoPendiente || 0)
        const pagado = monto - saldo
        return {
          monto: acc.monto + monto,
          pagado: acc.pagado + pagado,
          saldo: acc.saldo + saldo,
        }
      },
      { monto: 0, pagado: 0, saldo: 0 }
    )

    doc.setFontSize(11).setTextColor(255)
    doc.text(`POR RECUPERAR: ${formatMoney(totales.saldo)}`, anchoPagina - margen, 25, {
      align: 'right',
    })

    // --- TABLA DE PRÉSTAMOS ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [
        [
          'FECHA REG.',
          'TRABAJADOR',
          'MOTIVO / DESCRIPCIÓN',
          'M. PRESTADO',
          'M. PAGADO',
          'SALDO PENDIENTE',
          'ESTADO',
        ],
      ],
      body: prestamos.map((p) => {
        const d = p.detallePrestamo || {}
        const mTotal = parseFloat(d.montoTotal || 0)
        const sPendiente = parseFloat(d.saldoPendiente || 0)

        return [
          {
            content: new Date(d.createdAt || p.createdAt).toLocaleDateString('es-EC'),
            styles: { halign: 'center' },
          },
          {
            content: d.Persona?.nombreCompleto?.toUpperCase() || 'S/N',
            styles: { halign: 'left' },
          },
          {
            content: d.descripcion?.toUpperCase() || 'PRÉSTAMO PERSONAL',
            styles: { halign: 'left' },
          },
          {
            content: formatMoney(mTotal),
            styles: { halign: 'right' },
          },
          {
            content: formatMoney(mTotal - sPendiente),
            styles: { textColor: [0, 100, 0], halign: 'right' },
          },
          {
            content: formatMoney(sPendiente),
            styles: { fontStyle: 'bold', textColor: [150, 0, 0], halign: 'right' },
          },
          {
            content: (d.estado || 'PENDIENTE').toUpperCase(),
            styles: {
              halign: 'center',
              fontStyle: 'bold',
              fillColor: d.estado === 'Pagado' ? [200, 255, 200] : [255, 230, 230],
            },
          },
        ]
      }),
      theme: 'grid',
      headStyles: { fillColor: [230, 160, 0], textColor: 0, fontSize: 9, halign: 'center' },
      styles: { fontSize: 8, valign: 'middle' },
      columnStyles: {
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
      },
      foot: [
        [
          '',
          'TOTALES GENERALES',
          '',
          { content: formatMoney(totales.monto), styles: { halign: 'right' } },
          { content: formatMoney(totales.pagado), styles: { halign: 'right' } },
          { content: formatMoney(totales.saldo), styles: { halign: 'right' } },
          '',
        ],
      ],
      footStyles: { fillColor: [28, 31, 38], textColor: 255, fontStyle: 'bold' },
    })

    // --- BLOQUE DE FIRMAS ---
    const finalY = doc.lastAutoTable.finalY + 20
    if (finalY < 185) {
      doc.setDrawColor(180).setLineWidth(0.5)
      doc.line(margen, finalY, margen + 60, finalY)
      doc.line(anchoPagina - margen - 60, finalY, anchoPagina - margen, finalY)

      doc.setFontSize(8).setTextColor(100)
      doc.text('CONTABILIDAD / CAJA', margen + 30, finalY + 5, { align: 'center' })
      doc.text('RECIBÍ CONFORME (EMPLEADO)', anchoPagina - margen - 30, finalY + 5, {
        align: 'center',
      })
    }

    // --- NOTA AL PIE ---
    doc.setFontSize(8).setTextColor(120).setFont('helvetica', 'italic')
    doc.text(
      '* Este documento es un reporte oficial de Aroma de Oro. Los saldos reflejan los descuentos aplicados hasta la fecha.',
      margen,
      anchoPagina === 297 ? 200 : 280 // Ajuste según posición
    )

    doc.save(`PRESTAMOS_${periodoSel.toUpperCase()}_${new Date().getTime()}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo generar el reporte de préstamos detallado', 'error')
  }
}
