import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2' // Importamos la librería de alertas
import { formatMoney } from './fromatters'

export const exportarLiquidacionPDF = (liq, empresa) => {
  // 1. Mostrar mensaje de carga inmediatamente
  Swal.fire({
    title: 'Generando Documento',
    text: 'Por favor espere un momento...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  const img = new Image()
  img.src = '/AROMA-DE-ORO-LOGO.png'

  img.onload = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const anchoPagina = 297
      const margen = 12
      const widthTotal = anchoPagina - margen * 2
      const cCacaoGold = [217, 119, 6]

      // Fondo crema
      doc.setFillColor(254, 252, 232)
      doc.rect(0, 0, anchoPagina, 210, 'F')

      const baseConfig = {
        theme: 'grid',
        styles: {
          lineColor: 0,
          lineWidth: 0.2,
          fontSize: 8.5,
          textColor: 0,
          cellPadding: 2,
          valign: 'middle',
          halign: 'center',
          fillColor: [255, 255, 255],
        },
        headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
      }

      // --- 1. CABECERA CON LOGO ---
      autoTable(doc, {
        ...baseConfig,
        startY: 12,
        margin: { left: margen },
        tableWidth: widthTotal,
        body: [
          [
            {
              content: 'LIQUIDACIÓN DE COMPRA',
              rowSpan: 2,
              styles: { fontSize: 13, fontStyle: 'bold', cellWidth: 70 },
            },
            { content: 'ID COMPRA', styles: { fillColor: [245, 245, 245], cellWidth: 30 } },
            { content: liq.codigo || '-', styles: { fontStyle: 'bold', fontSize: 10 } },
            { content: '', rowSpan: 2, styles: { cellWidth: 80 } },
          ],
          [
            { content: 'FECHA', styles: { fillColor: [245, 245, 245] } },
            {
              content: new Date(liq.createdAt).toLocaleDateString(),
              styles: { fontStyle: 'bold' },
            },
          ],
        ],
        didDrawCell: (data) => {
          if (data.row.index === 0 && data.column.index === 3) {
            const p = 3
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
            doc.addImage(img, 'PNG', x, y, imgW, imgH)
          }
        },
      })

      // --- 2. PROVEEDOR ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + 1,
        margin: { left: margen },
        tableWidth: widthTotal,
        body: [
          [
            { content: 'PROVEEDOR', styles: { fillColor: [245, 245, 245], cellWidth: 30 } },
            {
              content: (liq.Persona?.nombreCompleto || 'N/A').toUpperCase(),
              styles: { halign: 'left', fontStyle: 'bold' },
            },
            { content: 'RUC / CÉDULA', styles: { fillColor: [245, 245, 245], cellWidth: 40 } },
            { content: liq.Persona?.numeroIdentificacion || 'N/A' },
          ],
          [
            { content: 'DIRECCIÓN', styles: { fillColor: [245, 245, 245] } },
            { content: liq.Persona?.direccion || 'S/D', styles: { halign: 'left' } },
            { content: 'TELÉFONO', styles: { fillColor: [245, 245, 245] } },
            { content: liq.Persona?.telefono || 'N/A' },
          ],
        ],
      })

      // --- 3. DETALLE PRODUCTO ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + 3,
        margin: { left: margen },
        head: [
          [
            'Descripción',
            'Calif.',
            'IVA',
            'Unidad',
            'Cantidad',
            'Peso Final',
            'Precio',
            'Prima',
            'Parcial',
          ],
        ],
        body: [
          [
            liq.DetalleLiquidacion?.descripcionProducto || 'CACAO SECO',
            {
              content: liq.DetalleLiquidacion?.calificacion || '-',
              styles: { textColor: cCacaoGold, fontStyle: 'bold' },
            },
            '0.0',
            (liq.DetalleLiquidacion?.unidad || 'QUINTALES').toUpperCase(),
            liq.DetalleLiquidacion?.cantidad || '0',
            parseFloat(liq.DetalleLiquidacion?.cantidadNeta || 0).toFixed(2),
            formatMoney(liq.DetalleLiquidacion?.precio || 0),
            formatMoney(liq.DetalleLiquidacion?.prima || 0),
            {
              content: formatMoney(liq.totalLiquidacion || 0),
              styles: { halign: 'right', fontStyle: 'bold' },
            },
          ],
        ],
        columnStyles: { 0: { halign: 'left' } },
      })

      // --- 4. TOTALES ---
      const yTot = doc.lastAutoTable.finalY + 3
      autoTable(doc, {
        ...baseConfig,
        startY: yTot,
        margin: { left: margen },
        tableWidth: widthTotal * 0.5,
        head: [['Id', 'Descripción retención', '%', 'Valor retenido']],
        body:
          liq.Retencions?.length > 0
            ? liq.Retencions.map((r, i) => [
                i + 1,
                r.descripcion,
                r.porcentajeRetencion + '%',
                formatMoney(r.valorRetenido),
              ])
            : [['1', 'RETENCIÓN DE LA FUENTE', '1.00%', formatMoney(liq.totalRetencion)]],
        columnStyles: { 1: { halign: 'left' }, 3: { halign: 'right' } },
      })

      autoTable(doc, {
        ...baseConfig,
        startY: yTot,
        margin: { left: margen + widthTotal * 0.5 + 2 },
        tableWidth: widthTotal * 0.5 - 2,
        body: [
          ['SUBTOTAL 12%:', { content: '$0.00', styles: { halign: 'right' } }],
          ['SUBTOTAL 0%:', { content: formatMoney(liq.subtotal_0), styles: { halign: 'right' } }],
          ['IVA:', { content: '$0.00', styles: { halign: 'right' } }],
          [
            { content: 'TOTAL FACTURA:', styles: { fontStyle: 'bold' } },
            {
              content: formatMoney(liq.subtotal_0),
              styles: { halign: 'right', fontStyle: 'bold' },
            },
          ],
          [
            { content: 'TOTAL RETENCIÓN:', styles: { textColor: [150, 0, 0] } },
            {
              content: `-${formatMoney(liq.totalRetencion)}`,
              styles: { halign: 'right', textColor: [150, 0, 0] },
            },
          ],
          [
            {
              content: 'TOTAL A PAGAR',
              styles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
            },
            {
              content: formatMoney(liq.totalAPagar),
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

      // --- 5. PAGOS ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + 3,
        margin: { left: margen },
        head: [['Efectivo', 'Cheque', 'Transferencia', 'Saldo Pendiente']],
        body: [
          [
            formatMoney(liq.pagoEfectivo),
            formatMoney(liq.pagoCheque),
            formatMoney(liq.pagoTransferencia),
            {
              content: formatMoney(liq.montoPorPagar),
              styles: { textColor: [180, 0, 0], fontStyle: 'bold' },
            },
          ],
        ],
      })

      // --- 6. FIRMAS ---
      const yFirmas = doc.lastAutoTable.finalY + 25
      doc.setDrawColor(0).setLineWidth(0.4)
      doc.line(margen + 20, yFirmas, margen + 90, yFirmas)
      doc
        .setFontSize(9)
        .setFont('helvetica', 'bold')
        .text('FIRMA VENDEDOR', margen + 55, yFirmas + 5, { align: 'center' })
      doc.line(anchoPagina - margen - 90, yFirmas, anchoPagina - margen - 20, yFirmas)
      doc.text('FIRMA COMPRADOR', anchoPagina - margen - 55, yFirmas + 5, { align: 'center' })

      // --- 7. PIE DINÁMICO ---
      const pie = `${(empresa?.nombre || 'AROMA DE ORO').toUpperCase()} | RUC: ${empresa?.ruc || ''} | Tel: ${empresa?.telefono || ''} | Dir: ${empresa?.direccion || ''}`
      doc
        .setFontSize(8)
        .setTextColor(100)
        .text(pie, anchoPagina / 2, 204, { align: 'center' })
      doc
        .setDrawColor(cCacaoGold[0], cCacaoGold[1], cCacaoGold[2])
        .setLineWidth(0.8)
        .line(margen, 206, anchoPagina - margen, 206)

      // 2. Guardar el PDF
      doc.save(`LIQ_${liq.codigo}.pdf`)

      // 3. Cerrar el SweetAlert automáticamente
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo generar el PDF', 'error')
    }
  }

  img.onerror = () => {
    Swal.fire('Error', 'No se pudo cargar el logo corporativo', 'error')
  }
}
