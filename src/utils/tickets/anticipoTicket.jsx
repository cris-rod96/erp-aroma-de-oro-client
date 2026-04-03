import jsPDF from 'jspdf'
import Swal from 'sweetalert2'
import { formatMoney } from '../fromatters'

export const exportarAnticipoTicket = (anticipo, empresa) => {
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
        format: [80, 180], // Largo suficiente para las firmas y notas
      })

      const ancho = 80
      const margen = 5
      let y = 10

      // --- CONFIGURACIÓN TIPO POS (COURIER) ---
      doc.setFont('courier', 'bold').setFontSize(11)

      // 1. CABECERA CORPORATIVA (Basada en tu modelo Empresa)
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
      doc.text('COMPROBANTE DE ANTICIPO', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text('******************************************', ancho / 2, y, { align: 'center' })

      // 2. DATOS DEL ANTICIPO Y PRODUCTOR
      y += 6
      doc.text(`ID: ${anticipo.id.substring(0, 8).toUpperCase()}`, margen, y)

      y += 4
      const fecha = new Date(anticipo.fechaEmision).toLocaleDateString('es-EC')
      const hora = new Date().toLocaleTimeString('es-EC', { hour12: false })
      doc.text(`FECHA: ${fecha}`, margen, y)
      doc.text(`HORA: ${hora}`, ancho - margen, y, { align: 'right' })

      y += 6
      doc.setFont('courier', 'bold')
      doc.text('PRODUCTOR:', margen, y)
      y += 4
      doc.setFont('courier', 'normal')
      const nombreProductor = (anticipo.Persona?.nombreCompleto || 'N/A').toUpperCase()
      doc.text(nombreProductor, margen, y)

      y += 4
      doc.text(`C.I./RUC: ${anticipo.Persona?.numeroIdentificacion || 'N/A'}`, margen, y)

      // 3. DETALLE DEL MONTO
      y += 6
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold')
      doc.text('CONCEPTO', margen, y)

      // Alineamos "MONTO" al centro de su columna
      const posXTotalLabel = ancho - margen - 8
      doc.text('MONTO', posXTotalLabel, y, { align: 'center' })

      y += 4
      doc.setFont('courier', 'normal')
      const concepto = 'ANTICIPO DE COSECHA'
      doc.text(concepto, margen, y)

      const montoStr = formatMoney(anticipo.monto)
      doc.text(montoStr, posXTotalLabel, y, { align: 'center' })

      // 4. OBSERVACIONES (Si existen)
      if (anticipo.comentario) {
        y += 6
        doc.setFont('courier', 'bold').setFontSize(7.5)
        doc.text('OBSERVACIONES:', margen, y)
        y += 3.5
        doc.setFont('courier', 'normal')
        const obsLineas = doc.splitTextToSize(anticipo.comentario.toUpperCase(), ancho - margen * 2)
        doc.text(obsLineas, margen, y)
        y += obsLineas.length * 3.5
      } else {
        y += 6
      }

      // 5. TOTAL DESTACADO
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFont('courier', 'bold').setFontSize(10)
      doc.text('VALOR ENTREGADO:', margen, y)
      doc.text(montoStr, posXTotalLabel, y, { align: 'center' })

      // 6. NOTA LEGAL (Importante para Aroma de Oro)
      y += 10
      doc.setFontSize(7).setFont('courier', 'normal')
      const nota = 'ESTE VALOR SERA DESCONTADO DE SU PROXIMA LIQUIDACION DE PRODUCTOS.'
      const notaLineas = doc.splitTextToSize(nota, ancho - margen * 2)
      doc.text(notaLineas, ancho / 2, y, { align: 'center' })

      // 7. ÁREA DE FIRMAS
      y += 18
      doc.text('_____________________      _____________________', ancho / 2, y, {
        align: 'center',
      })
      y += 4
      doc.setFontSize(7).setFont('courier', 'bold')
      doc.text('ENTREGUE (CAJA)            RECIBI CONFORME', ancho / 2, y, { align: 'center' })

      y += 5
      doc.setFontSize(6).setFont('courier', 'normal')
      doc.text(
        `C.I: ${anticipo.Persona?.numeroIdentificacion || '__________'}`,
        ancho - margen - 15,
        y,
        { align: 'center' }
      )

      // 8. PIE DE PÁGINA
      y += 12
      doc.setFontSize(7)
      doc.text('*** GRACIAS POR CONFIAR EN NOSOTROS ***', ancho / 2, y, { align: 'center' })
      y += 4
      doc.text('AROMA DE ORO - CONTROL INTERNO', ancho / 2, y, { align: 'center' })

      window.open(doc.output('bloburl'), '_blank')
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo generar el ticket de anticipo', 'error')
    }
  }, 150)
}
