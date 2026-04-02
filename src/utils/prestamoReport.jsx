import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarPrestamoPDF = (prestamo, empresa) => {
  Swal.fire({
    title: 'Generando Comprobante',
    text: 'Espere un momento...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  setTimeout(() => {
    const img = new Image()
    img.src = '/AROMA-DE-ORO-LOGO.png'

    img.onload = () => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        })

        const anchoPagina = 210
        const altoPagina = 297
        const margen = 10
        const widthTotal = anchoPagina - margen * 2
        const espaciado = 5

        // --- FONDO AMARILLO TENUE ---
        doc.setFillColor(254, 252, 230)
        doc.rect(0, 0, anchoPagina, altoPagina, 'F')

        const baseConfig = {
          theme: 'grid',
          styles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            fontSize: 7.5,
            textColor: [0, 0, 0],
            cellPadding: 1.5,
            valign: 'middle',
            halign: 'center',
            fillColor: [255, 255, 255],
          },
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        }

        const dibujarCopia = (startY, labelCopia) => {
          doc.setFontSize(7).setTextColor(120).setFont('helvetica', 'oblique')
          doc.text(labelCopia, anchoPagina - margen, startY - 2, { align: 'right' })

          // --- 1. CABECERA ---
          autoTable(doc, {
            ...baseConfig,
            startY: startY,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'COMPROBANTE DE CRÉDITO / PRÉSTAMO',
                  rowSpan: 2,
                  styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 50, halign: 'center' },
                },
                {
                  content: 'ID CRÉDITO',
                  styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
                },
                {
                  content: prestamo.id.substring(0, 8).toUpperCase(),
                  styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 25 },
                },
                { content: '', rowSpan: 2, styles: { cellWidth: 95, minCellHeight: 18 } },
              ],
              [
                { content: 'FECHA EMISIÓN', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
                {
                  content: new Date(prestamo.createdAt).toLocaleDateString(),
                  styles: { fontStyle: 'bold' },
                },
              ],
            ],
            didDrawCell: (data) => {
              if (data.row.index === 0 && data.column.index === 3) {
                const p = 0.8
                const slotW = data.cell.width - p * 2
                const slotH = data.cell.height - p * 2
                const ratio = img.width / img.height
                let imgW = slotW
                let imgH = slotW / ratio
                if (imgH > slotH) {
                  imgH = slotH
                  imgW = slotH * ratio
                }
                const x = data.cell.x + (data.cell.width - imgW) / 2
                const y = data.cell.y + (data.cell.height - imgH) / 2
                doc.addImage(img, 'JPEG', x, y, imgW, imgH, undefined, 'FAST')
              }
            },
          })

          // --- 2. DATOS DEL BENEFICIARIO ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'EMPLEADO:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: (prestamo.Persona?.nombreCompleto || 'N/A').toUpperCase(),
                  styles: { halign: 'center', fontStyle: 'bold', cellWidth: 70 },
                },
                {
                  content: 'IDENTIFICACIÓN:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: prestamo.Persona?.numeroIdentificacion || 'N/A',
                  styles: { cellWidth: 70, fontStyle: 'bold', halign: 'center' },
                },
              ],
            ],
          })

          // --- 3. DETALLE FINANCIERO DEL PRÉSTAMO ---
          const montoCuotaSugerido =
            parseFloat(prestamo.montoTotal) / parseInt(prestamo.cuotasPactadas)

          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [
              [
                'Concepto del Crédito',
                'Monto Total',
                'Cuotas Pactadas',
                'Valor x Cuota',
                'Saldo Inicial',
              ],
            ],
            body: [
              [
                'PRÉSTAMO PERSONAL / ANTICIPO',
                formatMoney(prestamo.montoTotal),
                prestamo.cuotasPactadas,
                formatMoney(montoCuotaSugerido),
                {
                  content: formatMoney(prestamo.montoTotal),
                  styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] },
                },
              ],
            ],
          })

          // --- 4. MOTIVO Y POLÍTICA ---
          const yFinDetalle = doc.lastAutoTable.finalY + espaciado
          autoTable(doc, {
            ...baseConfig,
            startY: yFinDetalle,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [['Observaciones / Motivo del Préstamo']],
            body: [[prestamo.comentario?.toUpperCase() || 'SIN OBSERVACIONES']],
            styles: { halign: 'left', cellPadding: 3 },
          })

          // Nota de compromiso
          doc.setFontSize(6.5).setTextColor(50).setFont('helvetica', 'italic')
          doc.text(
            'Autorizo expresamente a AROMA DE ORO a descontar de mis haberes las cuotas pactadas en este documento.',
            margen,
            doc.lastAutoTable.finalY + 4
          )

          // --- 5. FIRMAS ---
          const yFirmas = doc.lastAutoTable.finalY + 22
          doc
            .setDrawColor(0)
            .setLineWidth(0.3)
            .setFontSize(7)
            .setFont('helvetica', 'bold')
            .setTextColor(0)

          // Firma Gerencia
          doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
          doc.text('GERENCIA / AUTORIZADO', margen + 40, yFirmas + 4, { align: 'center' })

          // Firma Beneficiario
          doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
          doc.text('FIRMA DEL TRABAJADOR', anchoPagina - margen - 40, yFirmas + 4, {
            align: 'center',
          })
          doc.setFontSize(6.5).setFont('helvetica', 'normal')
          doc.text(
            `C.I: ${prestamo.Persona?.numeroIdentificacion || '__________'}`,
            anchoPagina - margen - 40,
            yFirmas + 8,
            { align: 'center' }
          )

          // --- 6. PIE CORPORATIVO ---
          const yPie = 143
          const infoPie = `${(empresa?.nombre || 'AROMA DE ORO').toUpperCase()} | RUC: ${empresa?.ruc || ''} | Dir: ${empresa?.direccion || ''}`

          if (startY > 148) {
            doc.line(margen, 285, anchoPagina - margen, 285)
            doc
              .setFontSize(6.5)
              .setTextColor(100)
              .text(infoPie, anchoPagina / 2, 289, { align: 'center' })
          } else {
            doc.line(margen, yPie, anchoPagina - margen, yPie)
            doc
              .setFontSize(6.5)
              .setTextColor(100)
              .text(infoPie, anchoPagina / 2, yPie + 4, { align: 'center' })
          }
        }

        // DIBUJAR LAS DOS COPIAS
        dibujarCopia(12, 'ORIGINAL - ARCHIVO CONTABLE')
        doc.setDrawColor(200).setLineWidth(0.1).setLineDash([2, 2])
        doc.line(margen, 148.5, anchoPagina - margen, 148.5)
        doc.setLineDash([])
        dibujarCopia(158, 'COPIA - TRABAJADOR')

        doc.save(`PRESTAMO_${prestamo.Persona?.nombreCompleto || 'EMPLEADO'}.pdf`)
        Swal.close()
      } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo generar el comprobante de préstamo', 'error')
      }
    }
  }, 150)
}
