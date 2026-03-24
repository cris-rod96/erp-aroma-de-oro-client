import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarVentaPDF = async (venta, empresa) => {
  // Alerta inicial
  Swal.fire({
    title: 'Generando Comprobante',
    text: 'Espere un momento...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  // Usamos una Promesa para manejar la carga de imagen sin bloquear el hilo
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

    // Pequeño delay para que Swal se renderice y el navegador no se asuste
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

    // --- COLOR DE FONDO INSTITUCIONAL ---
    doc.setFillColor(254, 252, 230)
    doc.rect(0, 0, anchoPagina, doc.internal.pageSize.height, 'F')

    const baseConfig = {
      theme: 'grid',
      margin: { left: margen, right: margen },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        fontSize: 7.5,
        textColor: [0, 0, 0],
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
    }

    const dibujarCopia = (startY, labelCopia) => {
      doc.setFontSize(7).setTextColor(120).setFont('helvetica', 'bold')
      doc.text(labelCopia, anchoPagina - margen, startY - 2, { align: 'right' })

      // --- 1. CABECERA CON NUEVO TÍTULO ---
      autoTable(doc, {
        ...baseConfig,
        startY: startY,
        tableWidth: widthTotal,
        body: [
          [
            {
              content: 'COMPROBANTE VENTA',
              rowSpan: 2,
              styles: { fontSize: 11, fontStyle: 'bold', cellWidth: 55 },
            },
            {
              content: 'CÓDIGO',
              styles: {
                fillColor: [240, 240, 240],
                cellWidth: 20,
                halign: 'center',
                fontStyle: 'bold',
              },
            },
            {
              content: venta.codigoVenta || '-',
              styles: { fontStyle: 'bold', fontSize: 10, cellWidth: 35, halign: 'center' },
            },
            { content: '', rowSpan: 2, styles: { cellWidth: 76 } },
          ],
          [
            {
              content: 'FECHA',
              styles: { fillColor: [240, 240, 240], halign: 'center', fontStyle: 'bold' },
            },
            {
              content: new Date(venta.createdAt).toLocaleString(),
              styles: { fontStyle: 'bold', halign: 'center' },
            },
          ],
        ],
        didDrawCell: (data) => {
          if (data.row.index === 0 && data.column.index === 3) {
            const ratio = img.width / img.height
            const imgH = data.cell.height - 4
            const imgW = imgH * ratio
            const x = data.cell.x + (data.cell.width - imgW) / 2
            const y = data.cell.y + 2
            doc.addImage(img, 'PNG', x, y, imgW, imgH, undefined, 'FAST')
          }
        },
      })

      // --- 2. CLIENTE ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + 3,
        tableWidth: widthTotal,
        body: [
          [
            {
              content: 'CLIENTE:',
              styles: { fillColor: [240, 240, 240], cellWidth: 25, fontStyle: 'bold' },
            },
            {
              content: (venta.Persona?.nombreCompleto || 'CONSUMIDOR FINAL').toUpperCase(),
              styles: { cellWidth: 95 },
            },
            {
              content: 'ID/RUC:',
              styles: { fillColor: [240, 240, 240], cellWidth: 25, fontStyle: 'bold' },
            },
            { content: venta.Persona?.numeroIdentificacion || 'N/A', styles: { cellWidth: 41 } },
          ],
        ],
      })

      // --- 3. DETALLE DE MERCANCÍA ---
      autoTable(doc, {
        ...baseConfig,
        startY: doc.lastAutoTable.finalY + 3,
        head: [
          [
            'PRODUCTO',
            'UNIDAD',
            'P. BRUTO',
            'CALIF %',
            'IMP %',
            'P. NETO',
            'PRECIO U.',
            'SUBTOTAL',
          ],
        ],
        body: [
          [
            venta.Producto?.nombre || 'PRODUCTO',
            venta.unidad,
            venta.cantidadBruta,
            `${venta.calificacion}%`,
            `${venta.impurezas}%`,
            {
              content: venta.cantidadNeta,
              styles: { fontStyle: 'bold', fillColor: [255, 255, 255] },
            },
            formatMoney(venta.precioUnitario),
            {
              content: formatMoney(venta.totalFactura),
              styles: { fontStyle: 'bold', halign: 'right' },
            },
          ],
        ],
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' },
          7: { halign: 'right', cellWidth: 30 },
        },
      })

      // --- 4. RESUMEN DE PAGOS Y SALDOS ---
      const yFinDetalle = doc.lastAutoTable.finalY + 3
      const colWidth = widthTotal / 2 - 2

      autoTable(doc, {
        ...baseConfig,
        startY: yFinDetalle,
        margin: { left: margen },
        tableWidth: colWidth,
        body: [
          [
            {
              content: 'MODALIDAD DE PAGO',
              colSpan: 2,
              styles: {
                fillColor: [30, 30, 30],
                textColor: 255,
                halign: 'center',
                fontStyle: 'bold',
              },
            },
          ],
          [
            'TIPO VENTA:',
            {
              content: (venta.tipoVenta || 'CONTADO').toUpperCase(),
              styles: { fontStyle: 'bold' },
            },
          ],
          ['ESTADO:', venta.montoPendiente > 0 ? 'PAGO PENDIENTE' : 'CANCELADO'],
        ],
      })

      autoTable(doc, {
        ...baseConfig,
        startY: yFinDetalle,
        margin: { left: margen + colWidth + 4 },
        tableWidth: colWidth,
        body: [
          ['SUBTOTAL:', { content: formatMoney(venta.totalFactura), styles: { halign: 'right' } }],
          [
            '(-) ANTICIPO PREVIO:',
            { content: `-${formatMoney(venta.montoAnticipo || 0)}`, styles: { halign: 'right' } },
          ],
          [
            '(-) ABONO EFECTIVO:',
            {
              content: `-${formatMoney(venta.montoAbonado || 0)}`,
              styles: { halign: 'right', textColor: [0, 100, 0] },
            },
          ],
          [
            {
              content: 'TOTAL A PAGAR',
              styles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
            },
            {
              content: formatMoney(venta.montoPendiente),
              styles: { fillColor: [0, 0, 0], textColor: 255, halign: 'right', fontStyle: 'bold' },
            },
          ],
        ],
      })

      // --- 5. FIRMAS ---
      const yFirmas = doc.lastAutoTable.finalY + 22
      doc.setDrawColor(0).setLineWidth(0.2)
      doc.line(margen + 5, yFirmas, margen + 75, yFirmas)
      doc
        .setFontSize(7)
        .setTextColor(0)
        .text('AUTORIZADO (AROMA DE ORO)', margen + 40, yFirmas + 4, { align: 'center' })

      doc.line(anchoPagina - margen - 75, yFirmas, anchoPagina - margen - 5, yFirmas)
      doc.text('RECIBÍ CONFORME (CLIENTE)', anchoPagina - margen - 40, yFirmas + 4, {
        align: 'center',
      })

      // --- 6. PIE DE PÁGINA ---
      const yPie = startY < 148 ? 144 : 290
      const lineaPie = `${empresa?.nombre || 'AROMA DE ORO'} | RUC: ${empresa?.ruc || '-'} | DIR: ${empresa?.direccion || 'S/D'} | TEL: ${empresa?.telefono || '-'}`

      doc.setFontSize(6.5).setTextColor(100).setFont('helvetica', 'normal')
      doc.text(lineaPie.toUpperCase(), anchoPagina / 2, yPie, { align: 'center' })
    }

    dibujarCopia(15, 'ORIGINAL - CONTABILIDAD')
    doc.setDrawColor(180).setLineDash([1, 1.5]).line(5, 148.5, 205, 148.5)
    doc.setLineDash([])
    dibujarCopia(162, 'COPIA - CLIENTE')

    // NOMBRE DEL ARCHIVO: FACTURA_VENTA_VNT-0001.pdf
    doc.save(`COMPROBANTE_VENTA_${venta.codigoVenta || 'VNT'}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Hubo un problema al generar la Factura de Venta', 'error')
  }
}
