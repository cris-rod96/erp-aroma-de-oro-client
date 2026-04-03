import jsPDF from 'jspdf'
import Swal from 'sweetalert2'
import { formatMoney } from '../fromatters'

export const exportarPrestamoTicket = (prestamo, empresa) => {
  Swal.fire({
    title: 'Generando Ticket...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  setTimeout(() => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 190], // Un poco más largo para el desglose de cuotas y firmas
      })

      const ancho = 80
      const margen = 5
      let y = 10

      // --- CONFIGURACIÓN FUENTE POS (COURIER) ---
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

      y += dirLineas.length * 3.5
      doc.text(`TELF: ${empresa?.telefono || '0967148226'}`, ancho / 2, y, { align: 'center' })

      y += 5
      doc.text('******************************************', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold').setFontSize(9)
      doc.text('COMPROBANTE DE PRESTAMO', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text('******************************************', ancho / 2, y, { align: 'center' })

      // 2. DATOS DEL TRABAJADOR
      y += 6
      doc.text(`ID CREDITO: ${prestamo.id.substring(0, 8).toUpperCase()}`, margen, y)

      y += 4
      const fecha = new Date(prestamo.createdAt).toLocaleDateString('es-EC')
      doc.text(`FECHA EMISION: ${fecha}`, margen, y)

      y += 6
      doc.setFont('courier', 'bold')
      doc.text('BENEFICIARIO:', margen, y)
      y += 4
      doc.setFont('courier', 'normal')
      doc.text((prestamo.Persona?.nombreCompleto || 'EMPLEADO N/A').toUpperCase(), margen, y)
      y += 4
      doc.text(`C.I.: ${prestamo.Persona?.numeroIdentificacion || 'N/A'}`, margen, y)

      // 3. DETALLE FINANCIERO (Alineación Centrada para Montos)
      y += 6
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold')
      doc.text('CONCEPTO', margen, y)

      const posXValores = ancho - margen - 10 // Punto central para la columna de valores
      doc.text('VALOR', posXValores, y, { align: 'center' })

      y += 5
      doc.setFont('courier', 'normal')

      // Monto Total
      doc.text('MONTO TOTAL:', margen, y)
      doc.text(formatMoney(prestamo.montoTotal), posXValores, y, { align: 'center' })

      y += 4
      // Cuotas
      const valorCuota = parseFloat(prestamo.montoTotal) / parseInt(prestamo.cuotasPactadas)
      doc.text(`CUOTAS: ${prestamo.cuotasPactadas}`, margen, y)

      y += 4
      // Valor por cuota
      doc.text('VALOR X CUOTA:', margen, y)
      doc.text(formatMoney(valorCuota), posXValores, y, { align: 'center' })

      // 4. OBSERVACIONES
      if (prestamo.comentario) {
        y += 7
        doc.setFont('courier', 'bold').setFontSize(7.5)
        doc.text('MOTIVO:', margen, y)
        y += 3.5
        doc.setFont('courier', 'normal')
        const obsLineas = doc.splitTextToSize(prestamo.comentario.toUpperCase(), ancho - margen * 2)
        doc.text(obsLineas, margen, y)
        y += obsLineas.length * 3.5
      } else {
        y += 7
      }

      // 5. POLITICA DE DESCUENTO
      y += 2
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFontSize(7).setFont('courier', 'italic')
      const nota = 'AUTORIZO EL DESCUENTO DE MIS HABERES DE LAS CUOTAS PACTADAS EN ESTE DOCUMENTO.'
      const notaLineas = doc.splitTextToSize(nota, ancho - margen * 2)
      doc.text(notaLineas, ancho / 2, y, { align: 'center' })

      // 6. FIRMAS
      y += 20
      doc.setFontSize(7).setFont('courier', 'normal')
      doc.text('_____________________      _____________________', ancho / 2, y, {
        align: 'center',
      })
      y += 4
      doc.setFontSize(7).setFont('courier', 'bold')
      doc.text('AUTORIZADO                 TRABAJADOR', ancho / 2, y, { align: 'center' })

      y += 5
      doc.setFontSize(6).setFont('courier', 'normal')
      doc.text(
        `C.I: ${prestamo.Persona?.numeroIdentificacion || '__________'}`,
        ancho - margen - 15,
        y,
        { align: 'center' }
      )

      // 7. PIE
      y += 12
      doc.setFontSize(7)
      doc.text('Soporte interno de egreso de caja.', ancho / 2, y, { align: 'center' })
      y += 3
      doc.text('Aroma de Oro - Gestion de Personal', ancho / 2, y, { align: 'center' })

      window.open(doc.output('bloburl'), '_blank')
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo generar el ticket de prestamo', 'error')
    }
  }, 150)
}
