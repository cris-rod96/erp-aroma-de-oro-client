import jsPDF from 'jspdf'
import Swal from 'sweetalert2'
import { formatMoney } from '../fromatters'

export const exportarLiquidacionTicket = (liq, empresa) => {
  Swal.fire({
    title: 'Generando Ticket de Compra...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  setTimeout(() => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 260], // Un poco más de aire para el desglose
      })

      const ancho = 80
      const margen = 5
      let y = 10
      const posDerecha = ancho - margen

      // --- CABECERA ---
      doc.setFont('courier', 'bold').setFontSize(11)
      doc.text((empresa?.nombre || 'AROMA DE ORO').toUpperCase(), ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text(`RUC: ${empresa?.ruc || '0940501596001'}`, ancho / 2, y, { align: 'center' })
      y += 4
      const dirLineas = doc.splitTextToSize(
        (empresa?.direccion || 'GUAYAS, EL EMPALME').toUpperCase(),
        ancho - 10
      )
      doc.text(dirLineas, ancho / 2, y, { align: 'center' })
      y += dirLineas.length * 3.5

      doc.text('******************************************', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold').setFontSize(9)
      doc.text('LIQUIDACION DE COMPRA', ancho / 2, y, { align: 'center' })
      y += 4
      doc.text(`NRO: ${liq.codigo || 'S/N'}`, ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text('******************************************', ancho / 2, y, { align: 'center' })

      // --- DATOS GENERALES ---
      y += 6
      doc.text(`FECHA: ${new Date(liq.createdAt).toLocaleDateString('es-EC')}`, margen, y)
      doc.text(
        `HORA: ${new Date().toLocaleTimeString('es-EC', { hour12: false })}`,
        posDerecha,
        y,
        { align: 'right' }
      )
      y += 4
      doc.setFont('courier', 'bold').text('PROVEEDOR:', margen, y)
      y += 4
      doc
        .setFont('courier', 'normal')
        .text((liq.Persona?.nombreCompleto || 'N/A').toUpperCase(), margen, y)
      y += 4
      doc.text(`RUC/CI: ${liq.Persona?.numeroIdentificacion || 'N/A'}`, margen, y)

      // --- ANÁLISIS DE PESO Y CALIDAD ---
      y += 8
      doc
        .setFont('courier', 'bold')
        .text('ANALISIS DE RECEPCION', ancho / 2, y, { align: 'center' })
      y += 3
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })

      const det = liq.DetalleLiquidacion
      const unidad = (det?.unidad || 'QQ').toUpperCase()
      const bruto = parseFloat(det?.cantidad || 0)
      const neto = parseFloat(det?.cantidadNeta || 0)
      const merma = bruto - neto

      y += 5
      doc.text((det?.descripcionProducto || 'CACAO').toUpperCase(), margen, y)
      y += 5
      doc.text(`PESO BRUTO:`, margen, y)
      doc.text(`${bruto.toFixed(2)} ${unidad}`, posDerecha, y, { align: 'right' })

      y += 4
      doc.text(`CALIFICACION:`, margen, y)
      doc.text(`${det?.calificacion || 0}%`, posDerecha, y, { align: 'right' })

      y += 4
      doc.text(`IMPUREZAS:`, margen, y)
      doc.text(`${det?.impurezas || 0}%`, posDerecha, y, { align: 'right' })

      if (merma > 0) {
        y += 4
        doc.setFont('courier', 'italic')
        doc.text(`(-) MERMA TOTAL:`, margen, y)
        doc.text(`-${merma.toFixed(2)} ${unidad}`, posDerecha, y, { align: 'right' })
      }

      y += 5
      doc.setFont('courier', 'bold')
      doc.text(`PESO NETO A PAGAR:`, margen, y)
      doc.text(`${neto.toFixed(2)} ${unidad}`, posDerecha, y, { align: 'right' })

      y += 5
      doc.text(`PRECIO X ${unidad}:`, margen, y)
      doc.text(`${formatMoney(det?.precio || 0)}`, posDerecha, y, { align: 'right' })

      // --- LIQUIDACIÓN ECONÓMICA ---
      y += 7
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 5
      doc.text('SUBTOTAL MERCADERIA:', margen, y)
      doc.text(formatMoney(liq.totalLiquidacion), posDerecha, y, { align: 'right' })

      // Retenciones dinámicas con porcentaje
      if (liq.Retencions && liq.Retencions.length > 0) {
        liq.Retencions.forEach((r) => {
          y += 4
          doc.setFont('courier', 'normal')
          doc.text(`(-) RET. ${r.porcentajeRetencion}%:`, margen, y)
          doc.text(`-${formatMoney(r.valorRetenido)}`, posDerecha, y, { align: 'right' })
        })
      } else if (liq.totalRetencion > 0) {
        y += 4
        doc.setFont('courier', 'normal')
        doc.text(`(-) RETENCION FUENTE:`, margen, y)
        doc.text(`-${formatMoney(liq.totalRetencion)}`, posDerecha, y, { align: 'right' })
      }

      if (liq.abonoAnticipo > 0) {
        y += 4
        doc.setFont('courier', 'normal')
        doc.text(`(-) ABONO ANTICIPO:`, margen, y)
        doc.text(`-${formatMoney(liq.abonoAnticipo)}`, posDerecha, y, { align: 'right' })
      }

      y += 6
      doc.setFont('courier', 'bold').setFontSize(10)
      doc.setFillColor(240, 240, 240)
      doc.rect(margen, y - 4, ancho - margen * 2, 6, 'F')
      doc.text('TOTAL A RECIBIR:', margen + 1, y)
      doc.text(formatMoney(liq.totalAPagar), posDerecha - 1, y, { align: 'right' })

      // --- FORMAS DE PAGO ---
      y += 10
      doc.setFontSize(8).text('PAGADO EN:', margen, y)
      y += 4
      doc.setFont('courier', 'normal')
      if (liq.pagoEfectivo > 0) {
        doc.text(`- EFECTIVO:`, margen, y)
        doc.text(formatMoney(liq.pagoEfectivo), posDerecha, y, { align: 'right' })
        y += 4
      }
      if (liq.pagoTransferencia > 0) {
        doc.text(`- TRANSFERENCIA:`, margen, y)
        doc.text(formatMoney(liq.pagoTransferencia), posDerecha, y, { align: 'right' })
        y += 4
      }
      if (liq.montoPorPagar > 0) {
        doc.setFont('courier', 'bold')
        doc.text(`- SALDO PENDIENTE:`, margen, y)
        doc.text(formatMoney(liq.montoPorPagar), posDerecha, y, { align: 'right' })
        y += 4
      }

      // --- FIRMAS ---
      y += 25
      doc.setFont('courier', 'normal').setFontSize(8)

      // 1. Líneas de firma centradas (Izquierda y Derecha)
      // La línea de Autorizado va del mm 10 al 35. La de Productor del 45 al 70.
      doc.line(10, y, 35, y)
      doc.line(45, y, 70, y)

      y += 4
      doc.setFont('courier', 'bold')
      // 2. Etiquetas centradas bajo cada línea
      doc.text('AUTORIZADO', 22.5, y, { align: 'center' }) // Centro de la primera línea
      doc.text('PRODUCTOR', 57.5, y, { align: 'center' }) // Centro de la segunda línea

      // 3. DATOS DEL PRODUCTOR (CENTRADOS BAJO SU ETIQUETA)
      y += 4
      doc.setFont('courier', 'normal').setFontSize(7)
      const nombreProd = (liq.Persona?.nombreCompleto || '').toUpperCase()
      const idProd = liq.Persona?.numeroIdentificacion || ''

      // Dividimos el nombre si es muy largo para que no choque con la otra firma
      const nombreCorto = doc.splitTextToSize(nombreProd, 35)

      doc.text(nombreCorto, 57.5, y, { align: 'center' })
      y += nombreCorto.length * 3
      doc.text(`C.I./RUC: ${idProd}`, 57.5, y, { align: 'center' })

      // --- PIE ---
      y += 15
      doc.setFontSize(7).setFont('courier', 'normal')
      doc.text('Documento de control interno para Aroma de Oro.', ancho / 2, y, { align: 'center' })
      y += 3
      doc.text('¡Gracias por su entrega!', ancho / 2, y, { align: 'center' })

      window.open(doc.output('bloburl'), '_blank')
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo generar el ticket mejorado', 'error')
    }
  }, 150)
}
