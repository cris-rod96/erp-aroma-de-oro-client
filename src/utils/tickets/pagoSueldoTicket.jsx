import jsPDF from 'jspdf'
import Swal from 'sweetalert2'
import { formatMoney } from '../fromatters'

export const exportarNominaTicket = (pago, empresa) => {
  Swal.fire({
    title: 'Generando Recibo...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  setTimeout(() => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 210], // Más largo para detallar ingresos y descuentos
      })

      const ancho = 80
      const margen = 5
      let y = 10

      // --- CONFIGURACIÓN POS (COURIER) ---
      doc.setFont('courier', 'bold').setFontSize(11)

      // 1. CABECERA (Datos de Aroma de Oro)
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

      y += 5
      doc.text('******************************************', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold').setFontSize(9)
      doc.text('RECIBO DE PAGO DE NOMINA', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text('******************************************', ancho / 2, y, { align: 'center' })

      // 2. DATOS DEL EMPLEADO
      y += 6
      doc.text(`COMPROBANTE: ${pago.codigo || 'S/N'}`, margen, y)
      y += 4
      const fecha = new Date(pago.createdAt).toLocaleDateString('es-EC')
      doc.text(`FECHA PAGO: ${fecha}`, margen, y)

      y += 6
      doc.setFont('courier', 'bold')
      doc.text('EMPLEADO:', margen, y)
      y += 4
      doc.setFont('courier', 'normal')
      doc.text((pago.Persona?.nombreCompleto || 'N/A').toUpperCase(), margen, y)
      doc.text(`C.I.: ${pago.Persona?.numeroIdentificacion || 'N/A'}`, margen, y + 4)

      // 3. DETALLE DE INGRESOS
      y += 10
      doc.setFont('courier', 'bold')
      doc.text('DESCRIPCION                 VALOR', margen, y)
      y += 3
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })

      y += 4
      doc.setFont('courier', 'normal')
      const posXVal = ancho - margen - 8 // Centro de la columna VALOR

      // Filas de Ingresos
      doc.text(`SUELDO (${pago.tipoPeriodo})`, margen, y)
      doc.text(formatMoney(pago.sueldoBase), posXVal, y, { align: 'center' })

      y += 4
      doc.text('BONOS / EXTRAS:', margen, y)
      doc.text(formatMoney(pago.bono), posXVal, y, { align: 'center' })

      y += 4
      doc.setFont('courier', 'bold')
      doc.text('SUBTOTAL INGRESOS:', margen, y)
      doc.text(formatMoney(pago.subTotal), posXVal, y, { align: 'center' })

      // 4. DETALLE DE DESCUENTOS (EGRESOS)
      y += 6
      doc.setFont('courier', 'bold')
      doc.text('DESCUENTOS / EGRESOS', margen, y)
      y += 3
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })

      y += 4
      doc.setFont('courier', 'normal')
      doc.text('DESCUENTO GENERAL:', margen, y)
      doc.text(`-${formatMoney(pago.descuentoGeneral)}`, posXVal, y, { align: 'center' })

      y += 4
      doc.text('PAGO PRESTAMO:', margen, y)
      doc.text(`-${formatMoney(pago.descuentoPrestamo)}`, posXVal, y, { align: 'center' })

      const totalDesc = parseFloat(pago.descuentoGeneral) + parseFloat(pago.descuentoPrestamo)
      y += 4
      doc.text('TOTAL DESCUENTOS:', margen, y)
      doc.text(`-${formatMoney(totalDesc)}`, posXVal, y, { align: 'center' })

      // 5. NETO A PAGAR (EL MÁS IMPORTANTE)
      y += 7
      doc.text('==========================================', ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFont('courier', 'bold').setFontSize(10)
      doc.text('NETO A RECIBIR:', margen, y)
      doc.text(formatMoney(pago.totalPagar), posXVal, y, { align: 'center' })

      // 6. FIRMAS
      y += 20
      doc.setFontSize(7).setFont('courier', 'normal')
      doc.text('_____________________      _____________________', ancho / 2, y, {
        align: 'center',
      })
      y += 4
      doc.setFont('courier', 'bold')
      doc.text('FIRMA AUTORIZADA           TRABAJADOR', ancho / 2, y, { align: 'center' })

      y += 5
      doc.setFontSize(6).setFont('courier', 'normal')
      doc.text(
        `C.I: ${pago.Persona?.numeroIdentificacion || '__________'}`,
        ancho - margen - 15,
        y,
        { align: 'center' }
      )

      // 7. PIE
      y += 12
      doc.setFontSize(7)
      doc.text('Comprobante de pago para fines internos.', ancho / 2, y, { align: 'center' })
      y += 3
      doc.text('Aroma de Oro - Gestion de Nomina', ancho / 2, y, { align: 'center' })

      window.open(doc.output('bloburl'), '_blank')
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo generar el recibo de nomina', 'error')
    }
  }, 150)
}
