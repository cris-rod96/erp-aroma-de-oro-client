import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarVentaPDF = async (venta, empresa) => {
  Swal.fire({
    title: 'Generando Comprobante',
    text: 'Espere un momento...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  const cargarImagen = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  try {
    const img = await cargarImagen('/AROMA-DE-ORO-LOGO.png')
    await new Promise((r) => setTimeout(r, 100))

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const anchoPagina = 210
    const margen = 12
    const widthTotal = anchoPagina - margen * 2
    const espaciado = 5

    // --- CÁLCULOS LÓGICOS ---
    const subtotalVenta = parseFloat(venta.totalFactura || 0)
    const retenciones = parseFloat(venta.valorRetenido || 0)
    const totalLiquidacionVenta = subtotalVenta - retenciones
    const anticiposAplicados = parseFloat(venta.montoAnticipo || 0)

    doc.setFillColor(254, 252, 230)
    doc.rect(0, 0, anchoPagina, doc.internal.pageSize.height, 'F')

    const baseConfig = {
      theme: 'grid',
      margin: { left: margen, right: margen },
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
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
    }

    const dibujarCopia = (startY, labelCopia) => {
      doc.setFontSize(7).setTextColor(120).setFont('helvetica', 'oblique')
      doc.text(labelCopia, anchoPagina - margen, startY - 2, { align: 'right' })

      // --- 1. CABECERA ---
      autoTable(doc, {
        ...baseConfig,
        startY: startY,
        tableWidth: widthTotal,
        body: [
          [
            {
              content: 'COMPROBANTE DE VENTA',
              rowSpan: 2,
              styles: { fontSize: 10, fontStyle: 'bold', cellWidth: 50, halign: 'left' },
            },
            {
              content: 'CÓDIGO',
              styles: { fillColor: [250, 250, 250], cellWidth: 20, fontSize: 7 },
            },
            {
              content: venta.codigoVenta || '-',
              styles: { fontStyle: 'bold', fontSize: 9, cellWidth: 25 },
            },
            { content: '', rowSpan: 2, styles: { cellWidth: 95, minCellHeight: 18 } },
          ],
          [
            { content: 'FECHA REG.', styles: { fillColor: [250, 250, 250], fontSize: 7 } },
            {
              content: new Date(venta.createdAt).toLocaleDateString(),
              styles: { fontStyle: 'bold' },
            },
          ],
        ],
        didDrawCell: (data) => {
          if (data.row.index === 0 && data.column.index === 3) {
            const p = 0.8
            const ratio = img.width / img.height
            const slotW = data.cell.width - p * 2
            const slotH = data.cell.height - p * 2
            let imgW = slotW
            let imgH = slotW / ratio
            if (imgH > slotH) {
              imgH = slotH
              imgW = slotH * ratio
            }
            const x = data.cell.x + (data.cell.width - imgW) / 2
            const y = data.cell.y + (data.cell.height - imgH) / 2
            doc.addImage(img, 'PNG', x, y, imgW, imgH, undefined, 'FAST')
          }
        },
      })

      // --- 2. CLIENTE ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + espaciado,
        tableWidth: widthTotal,
        body: [
          [
            {
              content: 'CLIENTE:',
              styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
            },
            {
              content: (venta.Persona?.nombreCompleto || 'CONSUMIDOR FINAL').toUpperCase(),
              styles: { halign: 'center', fontStyle: 'bold', cellWidth: 70 },
            },
            {
              content: 'RUC / CI:',
              styles: { fillColor: [250, 250, 250], cellWidth: 25, halign: 'right' },
            },
            {
              content: venta.Persona?.numeroIdentificacion || 'N/A',
              styles: { cellWidth: 70, fontStyle: 'bold' },
            },
          ],
        ],
      })

      const unidadesAbreviadas = {
        Quintales: 'QQ',
        Kilogramos: 'KG',
        Libras: 'LB',
        Tacho: 'TCH',
      }
      const unidadAbrev =
        unidadesAbreviadas[venta.Producto?.unidadMedida] || venta.Producto?.unidadMedida || 'Cant.'

      // --- 3. DETALLE MERCANCÍA ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + espaciado,
        tableWidth: widthTotal,
        head: [
          [
            'Producto',
            'Unidad',
            'Cant. Bruta',
            'Calif %',
            'Imp %',
            `Cant. Neta ${unidadAbrev}`,
            `Precio ${unidadAbrev}`,
            'Subtotal',
          ],
        ],
        body: [
          [
            venta.Producto?.nombre || 'PRODUCTO',
            (venta.unidad || 'QUINTALES').toUpperCase(),
            venta.cantidadBruta,
            `${venta.calificacion}%`,
            `${venta.impurezas}%`,
            { content: parseFloat(venta.cantidadNeta).toFixed(2), styles: { fontStyle: 'bold' } },
            formatMoney(venta.precioUnitario),
            {
              content: formatMoney(venta.totalFactura),
              styles: { halign: 'center', fontStyle: 'bold' },
            },
          ],
        ],
      })

      const yFinDetalle = doc.lastAutoTable.finalY + espaciado

      // --- 4. RETENCIONES (IZQUIERDA) ---
      autoTable(doc, {
        ...baseConfig,
        startY: yFinDetalle,
        margin: { left: margen },
        tableWidth: widthTotal * 0.48,
        head: [['Descripción Retención', '%', 'Valor']],
        body: [
          [
            venta.retencionConcepto || 'RETENCIÓN DE LA FUENTE',
            `${venta.retencionPorcentaje || 0}%`,
            formatMoney(venta.valorRetenido || 0),
          ],
        ],
        columnStyles: { 2: { halign: 'center' } },
      })

      // --- 5. TOTALES (DERECHA) ---
      autoTable(doc, {
        ...baseConfig,
        startY: yFinDetalle,
        margin: { left: margen + widthTotal * 0.52 },
        tableWidth: widthTotal * 0.48,
        body: [
          ['SUBTOTAL VENTA:', { content: formatMoney(subtotalVenta), styles: { halign: 'right' } }],
          [
            '(-) TOTAL RETENCIONES:',
            { content: `-${formatMoney(retenciones)}`, styles: { halign: 'right' } },
          ],
          [
            '(-) ANTICIPOS APLIC.:',
            { content: `-${formatMoney(anticiposAplicados)}`, styles: { halign: 'right' } },
          ],
          [
            {
              content: 'TOTAL VENTA',
              styles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
            },
            {
              content: formatMoney(totalLiquidacionVenta),
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

      // --- 6. FLUJO DE PAGOS (CORREGIDO CON DESGLOSE REAL) ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + espaciado,
        tableWidth: widthTotal,
        head: [['Efectivo Recibido', 'Transferencia', 'Abono Anticipo', 'Saldo Pendiente']],
        body: [
          [
            formatMoney(venta.pagoEfectivo || 0),
            formatMoney(venta.pagoTransferencia || 0),
            formatMoney(venta.montoAnticipo || 0),
            { content: formatMoney(venta.montoPendiente || 0), styles: { fontStyle: 'bold' } },
          ],
        ],
      })

      const yFirmas = doc.lastAutoTable.finalY + 22
      doc.setDrawColor(0).setLineWidth(0.3)
      doc.line(margen + 10, yFirmas, margen + 70, yFirmas)
      doc.text('AUTORIZADO (AROMA DE ORO)', margen + 40, yFirmas + 4, { align: 'center' })
      doc.line(anchoPagina - margen - 70, yFirmas, anchoPagina - margen - 10, yFirmas)
      doc.text('RECIBÍ CONFORME (CLIENTE)', anchoPagina - margen - 40, yFirmas + 4, {
        align: 'center',
      })

      const yPie = startY < 148 ? 143 : 289
      const lineaPie = `${empresa?.nombre || 'AROMA DE ORO'} | RUC: ${empresa?.ruc || '-'} | DIR: ${empresa?.direccion || 'S/D'}`
      doc
        .setFontSize(6.5)
        .setTextColor(100)
        .text(lineaPie.toUpperCase(), anchoPagina / 2, yPie, { align: 'center' })
    }

    dibujarCopia(12, 'ORIGINAL - CONTABILIDAD')
    doc
      .setDrawColor(200)
      .setLineWidth(0.1)
      .setLineDash([2, 2])
      .line(margen, 148.5, anchoPagina - margen, 148.5)
    doc.setLineDash([])
    dibujarCopia(158, 'COPIA - CLIENTE')

    doc.save(`COMPROBANTE_VENTA_${venta.codigoVenta}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo generar el documento', 'error')
  }
}
