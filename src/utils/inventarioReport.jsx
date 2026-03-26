import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

export const exportarInventarioPDF = async (
  movimientos,
  todosLosProductos,
  periodoSel,
  empresa
) => {
  if (!movimientos) return

  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const anchoPagina = 210
    const margen = 15

    // 1. LÓGICA DE FECHAS Y NOMBRE DE ARCHIVO DINÁMICO
    const meses = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ]
    const fechaHasta = new Date()
    const fechaDesde = new Date()

    let nombrePeriodo = periodoSel.toUpperCase()

    switch (periodoSel.toUpperCase()) {
      case 'DIARIO':
        fechaDesde.setHours(0, 0, 0, 0)
        break
      case 'SEMANAL':
        fechaDesde.setDate(fechaHasta.getDate() - 7)
        break
      case 'MENSUAL':
        fechaDesde.setMonth(fechaHasta.getMonth() - 1)
        nombrePeriodo = meses[fechaHasta.getMonth()] // Ej: MARZO
        break
      case 'TRIMESTRAL':
        fechaDesde.setMonth(fechaHasta.getMonth() - 3)
        nombrePeriodo = `${meses[fechaDesde.getMonth()]}_${meses[fechaHasta.getMonth()]}` // Ej: ENERO_MARZO
        break
      case 'ANUAL':
        fechaDesde.setFullYear(fechaHasta.getFullYear() - 1)
        break
      default:
        fechaDesde.setFullYear(2020, 0, 1)
        break
    }

    const nombreArchivo = `INVENTARIO_AROMA_DE_ORO_${nombrePeriodo}.pdf`
    const rangoFechas = `${fechaDesde.toLocaleDateString('es-EC')} - ${fechaHasta.toLocaleDateString('es-EC')}`

    // --- ORDENAR MOVIMIENTOS ---
    const movimientosOrdenados = [...movimientos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    )

    // --- CABECERA ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 40, 'F')
    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text(`REPORTE DE INVENTARIO`, anchoPagina - margen, 18, { align: 'right' })
    doc.setFontSize(14).setTextColor(230, 160, 0)
    doc.text(empresa?.nombre?.toUpperCase() || 'AROMA DE ORO', margen, 18)
    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`RUC: ${empresa?.ruc || '1234567890123'} | CONTROL DE EXISTENCIAS`, margen, 25)
    doc.text(`PERIODO: ${rangoFechas}`, margen, 30)

    // --- PROCESAMIENTO DE DATOS ---
    const saldosCalculados = {}
    const unidadesMedida = {}

    const bodyKardex = movimientosOrdenados.map((m) => {
      let nombreProd = 'S/N',
        cantidad = 0,
        tipo = '',
        unidad = '',
        ref = ''
      if (m.detalleCompra?.DetalleLiquidacion) {
        const d = m.detalleCompra.DetalleLiquidacion
        nombreProd = (d.Producto?.nombre || d.descripcionProducto || 'CACAO').toUpperCase()
        cantidad = parseFloat(d.cantidadNeta || 0)
        unidad = d.unidad || 'Quintales'
        tipo = 'ENTRADA'
        ref = m.detalleCompra.codigo || 'LIQ'
      } else if (m.detalleVenta) {
        const d = m.detalleVenta
        nombreProd = (d.Producto?.nombre || 'CACAO').toUpperCase()
        cantidad = parseFloat(d.cantidadNeta || 0)
        unidad = d.unidad || 'Quintales'
        tipo = 'SALIDA'
        ref = d.codigoVenta || 'VNT'
      }

      if (!saldosCalculados[nombreProd]) {
        saldosCalculados[nombreProd] = 0
        unidadesMedida[nombreProd] = unidad
      }
      const signo = tipo === 'ENTRADA' ? '+' : '-'
      if (tipo === 'ENTRADA') saldosCalculados[nombreProd] += cantidad
      else saldosCalculados[nombreProd] -= cantidad

      return [
        { content: new Date(m.fecha).toLocaleDateString('es-EC'), styles: { halign: 'center' } },
        nombreProd,
        {
          content: tipo,
          styles: {
            fontStyle: 'bold',
            textColor: tipo === 'ENTRADA' ? [34, 139, 34] : [178, 34, 34],
            halign: 'center',
          },
        },
        { content: ref, styles: { halign: 'center' } },
        { content: `${signo}${cantidad.toFixed(2)} ${unidad}`, styles: { halign: 'right' } },
        {
          content: `${saldosCalculados[nombreProd].toFixed(2)} ${unidad}`,
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] },
        },
      ]
    })

    // --- TABLA 1: KÁRDEX ---
    autoTable(doc, {
      startY: 45,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'PRODUCTO', 'MOVIMIENTO', 'REF.', 'CANTIDAD', 'SALDO TOTAL']],
      body: bodyKardex,
      theme: 'grid',
      headStyles: { fillColor: [230, 160, 0], textColor: 0, fontSize: 8, halign: 'center' },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
      },
    })

    // --- TABLA 2: RESUMEN GENERAL ---
    const finalY = doc.lastAutoTable.finalY + 12
    doc.setFontSize(10).setTextColor(28, 31, 38).setFont('helvetica', 'bold')
    doc.text('RESUMEN GENERAL DE STOCK (MAESTRO DE PRODUCTOS)', margen, finalY)

    const resumenData = todosLosProductos
      .map((p) => {
        const nombreUpper = p.nombre.toUpperCase()
        const stockFinal =
          saldosCalculados[nombreUpper] !== undefined
            ? saldosCalculados[nombreUpper]
            : parseFloat(p.stock || 0)
        return { nombre: nombreUpper, stock: stockFinal, unidad: p.unidadMedida || 'Quintales' }
      })
      .sort((a, b) => b.stock - a.stock)

    autoTable(doc, {
      startY: finalY + 5,
      margin: { left: margen, right: margen },
      head: [['PRODUCTO', 'STOCK ACTUAL', 'UNIDAD DE MEDIDA']],
      body: resumenData.map((r) => [r.nombre, r.stock.toFixed(2), r.unidad]),
      theme: 'striped',
      headStyles: { fillColor: [28, 31, 38], textColor: 255, fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, halign: 'center', cellPadding: 3 },
    })

    // --- FIRMAS ---
    const posicionFirmasY = 265
    doc
      .setDrawColor(180)
      .setLineWidth(0.5)
      .line(margen, posicionFirmasY, margen + 60, posicionFirmasY)
    doc.line(anchoPagina - margen - 60, posicionFirmasY, anchoPagina - margen, posicionFirmasY)
    doc
      .setFontSize(8)
      .setTextColor(100)
      .text('RESPONSABLE BODEGA', margen + 30, posicionFirmasY + 5, { align: 'center' })
    doc.text('GERENCIA / AUDITORÍA', anchoPagina - margen - 30, posicionFirmasY + 5, {
      align: 'center',
    })

    doc.save(nombreArchivo)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al generar el reporte', 'error')
  }
}
