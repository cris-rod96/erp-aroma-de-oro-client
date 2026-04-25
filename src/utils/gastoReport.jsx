import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters' // Asegúrate que el nombre del archivo sea correcto (tenías un typo en el ejemplo: fromatters)

export const exportarGastoPDF = (gasto, empresa) => {
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
    img.src = '/AROMA-DE-ORO-LOGO.png' // Tu logo actual

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

        // --- FONDO AMARILLO TENUE (Identidad Aroma de Oro) ---
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
                  content: 'COMPROBANTE DE EGRESO OPERATIVO',
                  rowSpan: 2,
                  styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 55, halign: 'center' },
                },
                {
                  content: 'N° GASTO',
                  styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
                },
                {
                  content: (gasto.codigo || 'S/N').toUpperCase(),
                  styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 35 },
                },
                { content: '', rowSpan: 2, styles: { cellWidth: 80, minCellHeight: 18 } },
              ],
              [
                { content: 'FECHA PAGO', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
                {
                  content: new Date(gasto.createdAt).toLocaleDateString('es-EC'),
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

          // --- 2. DETALLE DEL GASTO ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [['CATEGORÍA', 'JUSTIFICACIÓN / CONCEPTO', 'VALOR TOTAL']],
            body: [
              [
                {
                  content: (gasto.categoria || 'VARIOS').toUpperCase(),
                  styles: { fontStyle: 'bold' },
                },
                {
                  content: (gasto.descripcion || 'SIN DESCRIPCIÓN').toUpperCase(),
                  styles: { halign: 'center' },
                },
                {
                  content: formatMoney(gasto.monto),
                  styles: {
                    halign: 'center',
                    fontStyle: 'bold',
                    fontSize: 10,
                    fillColor: [245, 245, 245],
                  },
                },
              ],
            ],
          })

          // --- 3. INFORMACIÓN ADICIONAL ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'REGISTRADO POR:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 30, halign: 'right' },
                },
                {
                  content: (gasto.Usuario?.nombresCompletos || 'SISTEMA').toUpperCase(),
                  styles: { halign: 'center' },
                },
                {
                  content: 'CAJA ID:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 20, halign: 'center' },
                },
                {
                  content: (gasto.CajaId?.substring(0, 8) || 'N/A').toUpperCase(),
                  styles: { halign: 'center' },
                },
              ],
            ],
          })

          // --- 4. FIRMAS ---
          const yFirmas = doc.lastAutoTable.finalY + 22
          doc
            .setDrawColor(0)
            .setLineWidth(0.3)
            .setFontSize(7)
            .setFont('helvetica', 'bold')
            .setTextColor(0)

          // Firma Responsable Caja
          doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
          doc.text('ENTREGUÉ CONFORME', margen + 40, yFirmas + 4, { align: 'center' })
          doc.setFontSize(6).setFont('helvetica', 'normal')
          doc.text('(Responsable de Caja)', margen + 40, yFirmas + 7, { align: 'center' })

          // Firma Recibí Conforme
          doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
          doc.text('RECIBÍ CONFORME', anchoPagina - margen - 40, yFirmas + 4, { align: 'center' })
          doc.setFontSize(6).setFont('helvetica', 'normal')
          doc.text('Nombre: ____________________', anchoPagina - margen - 40, yFirmas + 7, {
            align: 'center',
          })
          doc.text('C.I: ____________________', anchoPagina - margen - 40, yFirmas + 10, {
            align: 'center',
          })

          // --- 5. PIE CORPORATIVO ---
          const yPie = 143
          const infoPie = `${(empresa?.nombre || 'AROMA DE ORO').toUpperCase()} | COMPROBANTE INTERNO DE CAJA CHICA`

          doc.setDrawColor(200).setLineWidth(0.1)
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
        dibujarCopia(12, 'ORIGINAL - CONTABILIDAD')
        doc.setDrawColor(180).setLineWidth(0.1).setLineDash([2, 2])
        doc.line(margen, 148.5, anchoPagina - margen, 148.5) // Línea de corte
        doc.setLineDash([])
        dibujarCopia(158, 'COPIA - CAJA')

        doc.save(`GASTO_${gasto.codigo || 'EGRESO'}.pdf`)
        Swal.close()
      } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo generar el PDF del gasto', 'error')
      }
    }
  }, 150)
}
