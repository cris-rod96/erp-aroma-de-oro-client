import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarAnticipoPDF = (anticipo, empresa) => {
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
                  content: 'COMPROBANTE DE ANTICIPO',
                  rowSpan: 2,
                  styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 50, halign: 'left' },
                },
                {
                  content: 'ID ANTICIPO',
                  styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
                },
                {
                  content: anticipo.id.substring(0, 8).toUpperCase(),
                  styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 25 },
                },
                { content: '', rowSpan: 2, styles: { cellWidth: 95, minCellHeight: 18 } },
              ],
              [
                { content: 'FECHA EMISIÓN', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
                {
                  content: new Date(anticipo.fechaEmision).toLocaleDateString(),
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

          // --- 2. DATOS DEL PRODUCTOR ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'PRODUCTOR:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: (anticipo.Persona?.nombreCompleto || 'N/A').toUpperCase(),
                  styles: { halign: 'center', fontStyle: 'bold', cellWidth: 70 },
                },
                {
                  content: 'CÉDULA/RUC:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: anticipo.Persona?.numeroIdentificacion || 'N/A',
                  styles: { cellWidth: 70, fontStyle: 'bold', halign: 'center' },
                },
              ],
            ],
          })

          // --- 3. VALOR DEL ANTICIPO ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [['Concepto de Pago', 'Estado', 'Monto Entregado']],
            body: [
              [
                'ANTICIPO PARA FUTURA ENTREGA DE COSECHA',
                anticipo.estado.toUpperCase(),
                {
                  content: formatMoney(anticipo.monto),
                  styles: {
                    halign: 'center',
                    fontStyle: 'bold',
                    fontSize: 11,
                    fillColor: [245, 245, 245],
                  },
                },
              ],
            ],
          })

          // --- 4. OBSERVACIONES ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [['Observaciones / Razón']],
            body: [[anticipo.comentario?.toUpperCase() || 'SIN OBSERVACIONES']],
            styles: { halign: 'left', cellPadding: 3 },
          })

          // Nota de descargo
          doc.setFontSize(6.5).setTextColor(50).setFont('helvetica', 'italic')
          doc.text(
            'El presente valor será descontado de la próxima liquidación de productos (Cacao/Maíz/Otros) entregados a la empresa.',
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

          doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
          doc.text('ENTREGADO POR (CAJA)', margen + 40, yFirmas + 4, { align: 'center' })

          doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
          doc.text('RECIBÍ CONFORME (PRODUCTOR)', anchoPagina - margen - 40, yFirmas + 4, {
            align: 'center',
          })
          doc.setFontSize(6.5).setFont('helvetica', 'normal')
          doc.text(
            `C.I: ${anticipo.Persona?.numeroIdentificacion || '__________'}`,
            anchoPagina - margen - 40,
            yFirmas + 8,
            { align: 'center' }
          )

          // --- 6. PIE ---
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

        dibujarCopia(12, 'ORIGINAL - COMPROBANTE DE EGRESO')
        doc.setDrawColor(200).setLineWidth(0.1).setLineDash([2, 2])
        doc.line(margen, 148.5, anchoPagina - margen, 148.5)
        doc.setLineDash([])
        dibujarCopia(158, 'COPIA - RECIBO PARA PRODUCTOR')

        doc.save(`COMPROBANTE_ANTICIPO_${anticipo.Persona?.nombreCompleto || 'PRODUCTOR'}.pdf`)
        Swal.close()
      } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo generar el comprobante', 'error')
      }
    }
  }, 150)
}
