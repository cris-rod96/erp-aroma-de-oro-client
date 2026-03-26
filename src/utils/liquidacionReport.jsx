// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import Swal from 'sweetalert2'
// import { formatMoney } from './fromatters'

// export const exportarLiquidacionPDF = (liq, empresa) => {
//   // 1. Alerta con retraso para evitar el bloqueo visual
//   Swal.fire({
//     title: 'Generando Documento',
//     text: 'Optimizando peso y formato para Aroma de Oro...',
//     allowOutsideClick: false,
//     didOpen: () => {
//       Swal.showLoading()
//     },
//   })

//   setTimeout(() => {
//     const img = new Image()
//     img.src = '/AROMA-DE-ORO-LOGO.png'

//     img.onload = () => {
//       try {
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: 'a4',
//           compress: true, // COMPRESIÓN ACTIVA
//         })

//         const anchoPagina = 210
//         const altoPagina = 297
//         const margen = 10
//         const widthTotal = anchoPagina - margen * 2
//         const espaciado = 5

//         // --- FONDO AMARILLO TENUE (TIPO FACTURA) ---
//         doc.setFillColor(254, 252, 230)
//         doc.rect(0, 0, anchoPagina, altoPagina, 'F')

//         const baseConfig = {
//           theme: 'grid',
//           styles: {
//             lineColor: [0, 0, 0],
//             lineWidth: 0.2,
//             fontSize: 7.5,
//             textColor: [0, 0, 0],
//             cellPadding: 1.5,
//             valign: 'middle',
//             halign: 'center',
//             fillColor: [255, 255, 255],
//           },
//           headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
//         }

//         const dibujarCopia = (startY, labelCopia) => {
//           doc.setFontSize(7).setTextColor(120).setFont('helvetica', 'oblique')
//           doc.text(labelCopia, anchoPagina - margen, startY - 2, { align: 'right' })

//           // --- 1. CABECERA (LOGO MAXIMIZADO) ---
//           autoTable(doc, {
//             ...baseConfig,
//             startY: startY,
//             margin: { left: margen },
//             tableWidth: widthTotal,
//             body: [
//               [
//                 {
//                   content: 'LIQUIDACIÓN DE COMPRA DIRECTA',
//                   rowSpan: 2,
//                   styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 50, halign: 'left' },
//                 },
//                 {
//                   content: 'ID COMPRA',
//                   styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
//                 },
//                 {
//                   content: liq.codigo || '-',
//                   styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 25 },
//                 },
//                 { content: '', rowSpan: 2, styles: { cellWidth: 95, minCellHeight: 18 } },
//               ],
//               [
//                 { content: 'FECHA REG.', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
//                 {
//                   content: new Date(liq.createdAt).toLocaleDateString(),
//                   styles: { fontStyle: 'bold' },
//                 },
//               ],
//             ],
//             didDrawCell: (data) => {
//               if (data.row.index === 0 && data.column.index === 3) {
//                 const p = 0.8
//                 const slotW = data.cell.width - p * 2
//                 const slotH = data.cell.height - p * 2
//                 const ratio = img.width / img.height
//                 let imgW = slotW
//                 let imgH = slotW / ratio
//                 if (imgH > slotH) {
//                   imgH = slotH
//                   imgW = slotH * ratio
//                 }
//                 const x = data.cell.x + (data.cell.width - imgW) / 2
//                 const y = data.cell.y + (data.cell.height - imgH) / 2

//                 // OPTIMIZACIÓN DE IMAGEN: JPEG + ALIAS + FAST
//                 doc.addImage(img, 'JPEG', x, y, imgW, imgH, 'logo_liq', 'FAST')
//               }
//             },
//           })

//           // --- 2. PROVEEDOR ---
//           autoTable(doc, {
//             ...baseConfig,
//             startY: doc.lastAutoTable.finalY + espaciado,
//             margin: { left: margen },
//             tableWidth: widthTotal,
//             body: [
//               [
//                 {
//                   content: 'PROVEEDOR:',
//                   styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
//                 },
//                 {
//                   content: (liq.Persona?.nombreCompleto || 'N/A').toUpperCase(),
//                   styles: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
//                 },
//                 {
//                   content: 'RUC / CI:',
//                   styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
//                 },
//                 {
//                   content: liq.Persona?.numeroIdentificacion || 'N/A',
//                   styles: { cellWidth: 70, fontStyle: 'bold' },
//                 },
//               ],
//               [
//                 { content: 'DIRECCIÓN:', styles: { fillColor: [250, 250, 250], halign: 'right' } },
//                 { content: liq.Persona?.direccion || 'S/D', styles: { halign: 'left' } },
//                 { content: 'TELÉFONO:', styles: { fillColor: [250, 250, 250], halign: 'right' } },
//                 { content: liq.Persona?.telefono || 'N/A' },
//               ],
//             ],
//           })

//           // --- 3. DETALLE ---
//           autoTable(doc, {
//             ...baseConfig,
//             startY: doc.lastAutoTable.finalY + espaciado,
//             margin: { left: margen },
//             tableWidth: widthTotal,
//             head: [
//               [
//                 'Descripción',
//                 'Calif. %',
//                 'Unidad',
//                 'Cant. Bruta',
//                 'Imp %',
//                 'Cant. Neta',
//                 'Precio U.',
//                 'Subtotal',
//               ],
//             ],
//             body: [
//               [
//                 liq.DetalleLiquidacion?.descripcionProducto || 'CACAO SECO',
//                 {
//                   content: liq.DetalleLiquidacion?.calificacion || '0',
//                   styles: { fontStyle: 'bold' },
//                 },
//                 (liq.DetalleLiquidacion?.unidad || 'QUINTALES').toUpperCase(),
//                 liq.DetalleLiquidacion?.cantidad || '0',
//                 `${liq.DetalleLiquidacion?.impurezas || 0}%`,
//                 {
//                   content: parseFloat(liq.DetalleLiquidacion?.cantidadNeta || 0).toFixed(2),
//                   styles: { fontStyle: 'bold' },
//                 },
//                 formatMoney(liq.DetalleLiquidacion?.precio || 0),
//                 {
//                   content: formatMoney(liq.totalLiquidacion || 0),
//                   styles: { halign: 'right', fontStyle: 'bold' },
//                 },
//               ],
//             ],
//             columnStyles: { 0: { halign: 'left' } },
//           })

//           // --- 4. RETENCIONES Y TOTALES (NEGRO PURO) ---
//           const yFinDetalle = doc.lastAutoTable.finalY + espaciado

//           autoTable(doc, {
//             ...baseConfig,
//             startY: yFinDetalle,
//             margin: { left: margen },
//             tableWidth: widthTotal * 0.48,
//             head: [['Descripción Retención', '%', 'Valor']],
//             body:
//               liq.Retencions?.length > 0
//                 ? liq.Retencions.map((r) => [
//                     r.descripcion,
//                     `${r.porcentajeRetencion}%`,
//                     formatMoney(r.valorRetenido),
//                   ])
//                 : [['RETENCIÓN DE LA FUENTE', '1%', formatMoney(liq.totalRetencion)]],
//             columnStyles: { 2: { halign: 'right', textColor: [0, 0, 0] } },
//           })

//           autoTable(doc, {
//             ...baseConfig,
//             startY: yFinDetalle,
//             margin: { left: margen + widthTotal * 0.52 },
//             tableWidth: widthTotal * 0.48,
//             body: [
//               [
//                 'SUBTOTAL:',
//                 { content: formatMoney(liq.totalLiquidacion), styles: { halign: 'right' } },
//               ],
//               [
//                 '(-) TOTAL RETENCIONES:',
//                 {
//                   content: `-${formatMoney(liq.totalRetencion)}`,
//                   styles: { halign: 'right', textColor: [0, 0, 0] },
//                 },
//               ],
//               [
//                 '(-) ABONO ANTICIPO:',
//                 {
//                   content: `-${formatMoney(liq.abonoAnticipo || 0)}`,
//                   styles: { halign: 'right', fontStyle: 'bold' },
//                 },
//               ],
//               [
//                 {
//                   content: 'TOTAL A PAGAR',
//                   styles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
//                 },
//                 {
//                   content: formatMoney(liq.totalAPagar),
//                   styles: {
//                     fillColor: [40, 40, 40],
//                     textColor: 255,
//                     halign: 'right',
//                     fontStyle: 'bold',
//                   },
//                 },
//               ],
//             ],
//           })

//           // --- 5. FLUJO CAJA ---
//           autoTable(doc, {
//             ...baseConfig,
//             startY: doc.lastAutoTable.finalY + espaciado,
//             margin: { left: margen },
//             tableWidth: widthTotal,
//             head: [['Efectivo', 'Cheque', 'Transferencia', 'Abono Ant.', 'Saldo Pendiente']],
//             body: [
//               [
//                 formatMoney(liq.pagoEfectivo),
//                 formatMoney(liq.pagoCheque),
//                 formatMoney(liq.pagoTransferencia),
//                 formatMoney(liq.abonoAnticipo || 0),
//                 {
//                   content: formatMoney(liq.montoPorPagar),
//                   styles: { textColor: [0, 0, 0], fontStyle: 'bold' },
//                 },
//               ],
//             ],
//           })

//           // --- 6. FIRMAS ---
//           const yFirmas = doc.lastAutoTable.finalY + 22
//           doc.setDrawColor(0).setLineWidth(0.3)
//           doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
//           doc.text('FIRMA AUTORIZADA', margen + 40, yFirmas + 4, { align: 'center' })
//           doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
//           doc.text('FIRMA PRODUCTOR', anchoPagina - margen - 40, yFirmas + 4, { align: 'center' })

//           // --- 7. PIE CORPORATIVO ---
//           const yPie = 143
//           const infoPie = `${(empresa?.nombre || 'AROMA DE ORO').toUpperCase()} | RUC: ${empresa?.ruc || ''} | Dir: ${empresa?.direccion || ''}`

//           if (startY > 148) {
//             doc.line(margen, 285, anchoPagina - margen, 285)
//             doc
//               .setFontSize(6.5)
//               .setTextColor(100)
//               .text(infoPie, anchoPagina / 2, 289, { align: 'center' })
//           } else {
//             doc.line(margen, yPie, anchoPagina - margen, yPie)
//             doc
//               .setFontSize(6.5)
//               .setTextColor(100)
//               .text(infoPie, anchoPagina / 2, yPie + 4, { align: 'center' })
//           }
//         }

//         dibujarCopia(12, 'ORIGINAL - CLIENTE')

//         doc.setDrawColor(200).setLineWidth(0.1).setLineDash([2, 2])
//         doc.line(margen, 148.5, anchoPagina - margen, 148.5)
//         doc.setLineDash([])

//         dibujarCopia(158, 'COPIA - ARCHIVO AROMA DE ORO')

//         doc.save(`LIQUIDACION_${liq.codigo}.pdf`)
//         Swal.close()
//       } catch (error) {
//         console.error(error)
//         Swal.fire('Error', 'No se pudo generar el documento', 'error')
//       }
//     }
//   }, 150)
// }

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarLiquidacionPDF = (liq, empresa) => {
  // 1. Alerta con retraso para evitar el bloqueo visual
  Swal.fire({
    title: 'Generando Documento',
    text: 'Optimizando peso y formato para Aroma de Oro...',
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

        // --- CÁLCULOS LÓGICOS PARA EL REPORTE ---
        // Total Factura: Cantidad Bruta * Precio (Sin descuentos de merma ni retención)
        const totalFactura =
          parseFloat(liq.DetalleLiquidacion?.cantidad || 0) *
          parseFloat(liq.DetalleLiquidacion?.precio || 0)
        // Total Retenciones
        const totalRetenciones = parseFloat(liq.totalRetencion || 0)
        // Total Liquidación: Es el Neto de la mercadería menos las retenciones
        const totalLiquidacion = parseFloat(liq.totalLiquidacion || 0) - totalRetenciones
        // Total a Pagar (Caja): Total Liquidación menos Anticipos
        const totalAPagarReal = totalLiquidacion - parseFloat(liq.abonoAnticipo || 0)

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

          autoTable(doc, {
            ...baseConfig,
            startY: startY,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'LIQUIDACIÓN DE COMPRA DIRECTA',
                  rowSpan: 2,
                  styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 50, halign: 'left' },
                },
                {
                  content: 'ID COMPRA',
                  styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
                },
                {
                  content: liq.codigo || '-',
                  styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 25 },
                },
                { content: '', rowSpan: 2, styles: { cellWidth: 95, minCellHeight: 18 } },
              ],
              [
                { content: 'FECHA REG.', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
                {
                  content: new Date(liq.createdAt).toLocaleDateString(),
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
                doc.addImage(img, 'JPEG', x, y, imgW, imgH, 'logo_liq', 'FAST')
              }
            },
          })

          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            body: [
              [
                {
                  content: 'PROVEEDOR:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: (liq.Persona?.nombreCompleto || 'N/A').toUpperCase(),
                  styles: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
                },
                {
                  content: 'RUC / CI:',
                  styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
                },
                {
                  content: liq.Persona?.numeroIdentificacion || 'N/A',
                  styles: { cellWidth: 70, fontStyle: 'bold' },
                },
              ],
              [
                { content: 'DIRECCIÓN:', styles: { fillColor: [250, 250, 250], halign: 'right' } },
                { content: liq.Persona?.direccion || 'S/D', styles: { halign: 'left' } },
                { content: 'TELÉFONO:', styles: { fillColor: [250, 250, 250], halign: 'right' } },
                { content: liq.Persona?.telefono || 'N/A' },
              ],
            ],
          })

          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [
              [
                'Descripción',
                'Calif. %',
                'Unidad',
                'Cant. Bruta',
                'Imp %',
                'Cant. Neta',
                'Precio U.',
                'Subtotal',
              ],
            ],
            body: [
              [
                liq.DetalleLiquidacion?.descripcionProducto || 'CACAO SECO',
                {
                  content: liq.DetalleLiquidacion?.calificacion || '0',
                  styles: { fontStyle: 'bold' },
                },
                (liq.DetalleLiquidacion?.unidad || 'QUINTALES').toUpperCase(),
                liq.DetalleLiquidacion?.cantidad || '0',
                `${liq.DetalleLiquidacion?.impurezas || 0}%`,
                {
                  content: parseFloat(liq.DetalleLiquidacion?.cantidadNeta || 0).toFixed(2),
                  styles: { fontStyle: 'bold' },
                },
                formatMoney(liq.DetalleLiquidacion?.precio || 0),
                {
                  content: formatMoney(liq.totalLiquidacion || 0),
                  styles: { halign: 'right', fontStyle: 'bold' },
                },
              ],
            ],
            columnStyles: { 0: { halign: 'left' } },
          })

          const yFinDetalle = doc.lastAutoTable.finalY + espaciado

          // RETENCIONES
          autoTable(doc, {
            ...baseConfig,
            startY: yFinDetalle,
            margin: { left: margen },
            tableWidth: widthTotal * 0.48,
            head: [['Descripción Retención', '%', 'Valor']],
            body:
              liq.Retencions?.length > 0
                ? liq.Retencions.map((r) => [
                    r.descripcion,
                    `${r.porcentajeRetencion}%`,
                    formatMoney(r.valorRetenido),
                  ])
                : [['RETENCION DE LA FUENTE', '1%', formatMoney(liq.totalRetencion)]],
            columnStyles: { 2: { halign: 'right', textColor: [0, 0, 0] } },
          })

          // TOTALES (ETIQUETAS CORREGIDAS)
          autoTable(doc, {
            ...baseConfig,
            startY: yFinDetalle,
            margin: { left: margen + widthTotal * 0.52 },
            tableWidth: widthTotal * 0.48,
            body: [
              [
                'TOTAL FACTURA:',
                { content: formatMoney(totalFactura), styles: { halign: 'right' } },
              ],
              [
                '(-) TOTAL RETENCIONES:',
                {
                  content: `-${formatMoney(totalRetenciones)}`,
                  styles: { halign: 'right', textColor: [0, 0, 0] },
                },
              ],
              [
                {
                  content: 'TOTAL LIQUIDACIÓN',
                  styles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
                },
                {
                  content: formatMoney(totalLiquidacion),
                  styles: {
                    fillColor: [40, 40, 40],
                    textColor: 255,
                    halign: 'right',
                    fontStyle: 'bold',
                  },
                },
              ],
            ],
          })

          // --- 5. FLUJO CAJA (COLUMNAS CORREGIDAS) ---
          autoTable(doc, {
            ...baseConfig,
            startY: doc.lastAutoTable.finalY + espaciado,
            margin: { left: margen },
            tableWidth: widthTotal,
            head: [
              [
                'Efectivo',
                'Cheque',
                'Transferencia',
                'Por Pagar',
                'Abono Anticipado',
                'Total a Pagar',
              ],
            ],
            body: [
              [
                formatMoney(liq.pagoEfectivo),
                formatMoney(liq.pagoCheque),
                formatMoney(liq.pagoTransferencia),
                formatMoney(liq.montoPorPagar), // Saldo pendiente
                formatMoney(liq.abonoAnticipo || 0),
                {
                  content: formatMoney(totalAPagarReal),
                  styles: { textColor: [0, 0, 0], fontStyle: 'bold' },
                },
              ],
            ],
          })

          const yFirmas = doc.lastAutoTable.finalY + 22
          doc.setDrawColor(0).setLineWidth(0.3)
          doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
          doc.text('FIRMA AUTORIZADA', margen + 40, yFirmas + 4, { align: 'center' })
          doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
          doc.text('FIRMA PRODUCTOR', anchoPagina - margen - 40, yFirmas + 4, { align: 'center' })

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

        dibujarCopia(12, 'ORIGINAL - CLIENTE')
        doc.setDrawColor(200).setLineWidth(0.1).setLineDash([2, 2])
        doc.line(margen, 148.5, anchoPagina - margen, 148.5)
        doc.setLineDash([])
        dibujarCopia(158, 'COPIA - ARCHIVO AROMA DE ORO')

        doc.save(`LIQUIDACION_${liq.codigo}.pdf`)
        Swal.close()
      } catch (error) {
        console.error(error)
        Swal.fire('Error', 'No se pudo generar el documento', 'error')
      }
    }
  }, 150)
}
