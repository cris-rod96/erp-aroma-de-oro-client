import jsPDF from 'jspdf'
import Swal from 'sweetalert2'
import { formatMoney } from '../fromatters'

export const exportarGastoTicket = (gasto, empresa) => {
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
        format: [80, 180],
      })

      const ancho = 80
      const margen = 5
      let y = 10

      doc.setFont('courier', 'bold').setFontSize(11)

      // 1. CABECERA
      doc.text((empresa?.nombre || 'AROMA DE ORO').toUpperCase(), ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text(`RUC: ${empresa?.ruc || '0940501596001'}`, ancho / 2, y, { align: 'center' })
      y += 4
      doc.text((empresa?.direccion || 'GUAYAS, EL EMPALME').toUpperCase(), ancho / 2, y, {
        align: 'center',
      })
      y += 4
      doc.text(`TELF: ${empresa?.telefono || '0967148226'}`, ancho / 2, y, { align: 'center' })

      if (empresa?.correo) {
        y += 4
        doc.text(empresa.correo.toLowerCase(), ancho / 2, y, { align: 'center' })
      }

      y += 5
      doc.text('******************************************', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold').setFontSize(9)
      doc.text('COMPROBANTE DE GASTO INTERNO', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text('******************************************', ancho / 2, y, { align: 'center' })

      // 2. DATOS
      y += 6
      doc.text(`NRO GASTO: ${gasto.codigo || 'GAS-0000001'}`, margen, y)
      y += 4
      const fechaObj = new Date(gasto.createdAt)
      doc.text(`FECHA: ${fechaObj.toLocaleDateString('es-EC')}`, margen, y)
      doc.text(
        `HORA: ${fechaObj.toLocaleTimeString('es-EC', { hour12: false })}`,
        ancho - margen,
        y,
        { align: 'right' }
      )

      // 3. TABLA DE DESCRIPCIÓN (Alineación corregida)
      y += 8
      doc.setFont('courier', 'bold')
      doc.text('DESCRIPCION', margen, y)
      // "TOTAL" centrado en su columna imaginaria a la derecha
      const posXTotalLabel = ancho - margen - 7
      doc.text('TOTAL', posXTotalLabel, y, { align: 'center' })

      y += 3
      doc.setFont('courier', 'normal')
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })

      // --- MANEJO DE DESCRIPCIÓN MULTILÍNEA ---
      y += 5
      const anchoDesc = 45 // Dejamos espacio para que no choque con el precio
      const descLineas = doc.splitTextToSize(
        (gasto.descripcion || 'SIN CONCEPTO').toUpperCase(),
        anchoDesc
      )

      const precioStr = formatMoney(gasto.monto)

      // Dibujamos el precio centrado bajo la palabra "TOTAL"
      doc.text(precioStr, posXTotalLabel, y, { align: 'center' })

      // Dibujamos las líneas de la descripción
      doc.text(descLineas, margen, y)

      // Ajustamos 'y' dinámicamente según cuántas líneas ocupó la descripción
      y += descLineas.length * 4 + 4

      // 4. TOTAL FINAL
      doc.text('------------------------------------------', ancho / 2, y, { align: 'center' })
      y += 5
      doc.setFont('courier', 'bold').setFontSize(10)
      doc.text('TOTAL A PAGAR:', margen, y)
      // También centramos el valor final bajo el anterior
      doc.text(precioStr, posXTotalLabel, y, { align: 'center' })

      // 5. PIE
      y += 10
      doc.setFont('courier', 'normal').setFontSize(8)
      doc.text(`CATEGORIA: ${(gasto.categoria || 'ALIMENTACIÓN').toUpperCase()}`, margen, y)
      y += 4
      doc.text(`CAJERO: ${(gasto.Usuario?.nombresCompletos || 'SUPER').toUpperCase()}`, margen, y)

      y += 15
      doc.text('__________________________________________', ancho / 2, y, { align: 'center' })
      y += 4
      doc.setFont('courier', 'bold').text('RECIBI CONFORME', ancho / 2, y, { align: 'center' })
      y += 6
      doc.setFont('courier', 'normal').setFontSize(7.5)
      doc.text('NOMBRE: ________________________________', margen + 2, y)
      y += 4
      doc.text('C.I./RUC: ______________________________', margen + 2, y)

      y += 12
      doc.setFontSize(7)
      doc.text('Soporte de egreso para arqueo de caja.', ancho / 2, y, { align: 'center' })
      y += 3
      doc.text('Documento no valido para tributacion.', ancho / 2, y, { align: 'center' })

      window.open(doc.output('bloburl'), '_blank')
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Error al generar el ticket', 'error')
    }
  }, 150)
}
