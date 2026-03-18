import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

export const exportarKardexPDF = (dataProcesada, cajas, cajaId, filtroTipo, productos) => {
  if (!dataProcesada || dataProcesada.length === 0) {
    Swal.fire({
      title: 'Aviso del Sistema',
      text: 'No se encontraron movimientos operativos para generar el reporte.',
      icon: 'info',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Entendido',
    })
    return
  }

  const doc = new jsPDF()
  const fechaFull = new Date().toLocaleString('es-EC')
  const colorEmpresa = [30, 41, 59]
  const colorAcento = [4, 120, 87]

  const titulos = {
    todos: 'BALANCE OPERATIVO CONSOLIDADO',
    inventario: 'REPORTE DE MOVIMIENTOS DE STOCK',
    gastos: 'REPORTE DE NÓMINA Y EGRESOS',
  }

  const cajaActual = cajas.find((c) => c.id === cajaId)
  const mOpen = cajaActual ? parseFloat(cajaActual.montoApertura) : 0
  const fechaAperturaCaja = cajaActual
    ? new Date(cajaActual.fechaApertura).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'CONSOLIDADO'

  // --- CABECERA ---
  doc.setFillColor(colorAcento[0], colorAcento[1], colorAcento[2])
  doc.rect(0, 0, 8, 45, 'F')

  doc
    .setFont('helvetica', 'bold')
    .setFontSize(28)
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
  doc.text('AROMA DE ORO', 14, 20)

  doc
    .setFontSize(12)
    .setFont('helvetica', 'normal')
    .setTextColor(colorAcento[0], colorAcento[1], colorAcento[2])
  doc.text(titulos[filtroTipo], 14, 28)

  doc.setDrawColor(colorAcento[0], colorAcento[1], colorAcento[2]).setLineWidth(0.6)
  doc.line(14, 30, 85, 30)

  doc.setFontSize(8.5).setTextColor(75, 85, 99).setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE CAJA', 130, 15)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  doc.text(`Caja Apertura: ${fechaAperturaCaja}`, 130, 20)
  doc.text(`Monto Apertura: $${mOpen.toFixed(2)}`, 130, 25)
  doc.setTextColor(107, 114, 128)
  doc.text(`Emisión: ${fechaFull}`, 130, 30)

  let currentY = 55

  // --- PROCESAMIENTO DE SALDO ---
  let saldoTracker = mOpen
  const dataConSaldo = [...dataProcesada]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((m) => {
      const monto = parseFloat(m.monto)
      m.tipoMovimiento === 'Ingreso' ? (saldoTracker += monto) : (saldoTracker -= monto)
      return { ...m, saldoAcumulado: saldoTracker }
    })
    .reverse()

  // --- TABLA PRODUCTOS ---
  if (filtroTipo === 'todos' || filtroTipo === 'inventario') {
    const dataProductos = dataConSaldo.filter((m) => m.tipoInterfaz === 'inventario')
    if (dataProductos.length > 0) {
      if (filtroTipo === 'todos') {
        doc
          .setFontSize(10)
          .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
          .setFont('helvetica', 'bold')
        doc.text('MOVIMIENTOS DE BODEGA Y STOCK', 14, currentY)
        currentY += 4
      }
      autoTable(doc, {
        startY: currentY,
        head: [['FECHA', 'CONCEPTO', 'PRODUCTO', 'CANTIDAD', 'MOVIMIENTO', 'SALDO CAJA']],
        body: dataProductos.map((m) => [
          new Date(m.fecha).toLocaleDateString('es-EC'),
          m.categoria.toUpperCase(),
          (productos.find((p) => p.id === m.ProductoId)?.nombre || 'S/N').toUpperCase(),
          m.cantidadMov.toFixed(2),
          {
            content: `${m.tipoMovimiento === 'Ingreso' ? '+' : '-'}$${parseFloat(m.monto).toFixed(2)}`,
            styles: {
              textColor: m.tipoMovimiento === 'Ingreso' ? [20, 83, 45] : [185, 28, 28],
              fontStyle: 'bold',
            },
          },
          `$${m.saldoAcumulado.toFixed(2)}`,
        ]),
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: colorEmpresa },
        columnStyles: { 2: { halign: 'left' }, 5: { fontStyle: 'bold', halign: 'right' } },
      })
      currentY = doc.lastAutoTable.finalY + 12
    }
  }

  // --- TABLA NÓMINA ---
  if (filtroTipo === 'todos' || filtroTipo === 'gastos') {
    const dataGastos = dataConSaldo.filter((m) => m.tipoInterfaz === 'gastos')
    if (dataGastos.length > 0) {
      if (filtroTipo === 'todos') {
        doc
          .setFontSize(10)
          .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
          .setFont('helvetica', 'bold')
        doc.text('DETALLE DE NÓMINA Y GASTOS', 14, currentY)
        currentY += 4
      }
      autoTable(doc, {
        startY: currentY,
        head: [['FECHA', 'TRABAJADOR / CONCEPTO', 'DÍAS', 'V. JORNAL', 'PAGO NETO', 'SALDO CAJA']],
        body: dataGastos.map((m) => [
          new Date(m.fecha).toLocaleDateString('es-EC'),
          (m.detalleNomina?.Persona?.nombresCompletos || 'GASTO GENERAL').toUpperCase(),
          m.detalleNomina?.diasTrabajados || '---',
          m.detalleNomina?.valorJornal
            ? `$${parseFloat(m.detalleNomina.valorJornal).toFixed(2)}`
            : '---',
          {
            content: `-$${parseFloat(m.monto).toFixed(2)}`,
            styles: { textColor: [185, 28, 28], fontStyle: 'bold' },
          },
          `$${m.saldoAcumulado.toFixed(2)}`,
        ]),
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: colorAcento },
        columnStyles: {
          1: { halign: 'left' },
          5: { fontStyle: 'bold', halign: 'right', fillColor: [248, 250, 252] },
        },
      })
      currentY = doc.lastAutoTable.finalY + 12
    }
  }

  // --- RESUMEN DE ARQUEO (Rediseñado y centrado) ---
  const totalIngresos = dataProcesada
    .filter((m) => m.tipoMovimiento === 'Ingreso')
    .reduce((a, b) => a + parseFloat(b.monto), 0)
  const totalEgresos = dataProcesada
    .filter((m) => m.tipoMovimiento === 'Egreso')
    .reduce((a, b) => a + parseFloat(b.monto), 0)
  const balanceNeto = mOpen + totalIngresos - totalEgresos

  doc
    .setFontSize(10)
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
    .setFont('helvetica', 'bold')
  doc.text('RESUMEN CONTABLE Y ARQUEO DE CAJA', 14, currentY)

  autoTable(doc, {
    startY: currentY + 4,
    head: [
      [
        { content: 'CONCEPTO CONTABLE', styles: { halign: 'left' } },
        { content: 'VALOR', styles: { halign: 'right' } },
      ],
    ],
    body: [
      ['(+) APERTURA INICIAL DE CAJA', `$${mOpen.toFixed(2)}`],
      ['(+) TOTAL INGRESOS DEL PERIODO', `$${totalIngresos.toFixed(2)}`],
      ['(-) TOTAL EGRESOS DEL PERIODO', `$${totalEgresos.toFixed(2)}`],
      [
        {
          content: '(=) CIERRE ESPERADO EN CAJA',
          styles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
        },
        {
          content: `$${balanceNeto.toFixed(2)}`,
          styles: {
            fontStyle: 'bold',
            halign: 'right',
            textColor: [20, 83, 45],
            fillColor: [243, 244, 246],
          },
        },
      ],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 4, font: 'helvetica' },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right', cellWidth: 40 }, // Arregla el descuadre del encabezado "VALOR"
    },
    didDrawCell: (data) => {
      if (data.row.index === 3) {
        doc.setDrawColor(200).setLineWidth(0.2)
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y)
      }
    },
  })

  doc.save(`Balance_AromaOro_${filtroTipo}_${Date.now()}.pdf`)
}
