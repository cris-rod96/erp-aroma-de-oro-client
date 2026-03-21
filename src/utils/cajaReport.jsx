import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarCajaDetallePDF = (caja) => {
  if (!caja || !caja.Movimientos || caja.Movimientos.length === 0) {
    Swal.fire({
      title: 'Sin Movimientos',
      text: 'No hay datos de transacciones para generar este reporte.',
      icon: 'info',
      confirmButtonColor: '#0f172a',
    })
    return
  }

  const doc = new jsPDF()
  const colorEmpresa = [15, 23, 42] // Slate 900
  const colorAcento = [245, 158, 11] // Amber 500
  const fechaFull = new Date().toLocaleString('es-EC')

  // --- CONFIGURACIÓN DE DATOS ---
  const mOpen = parseFloat(caja.montoApertura) || 0
  const totalIngresos = caja.Movimientos.filter((m) => m.tipoMovimiento === 'Ingreso').reduce(
    (acc, curr) => acc + parseFloat(curr.monto),
    0
  )
  const totalEgresos = caja.Movimientos.filter((m) => m.tipoMovimiento === 'Egreso').reduce(
    (acc, curr) => acc + parseFloat(curr.monto),
    0
  )
  const saldoEsperado = mOpen + totalIngresos - totalEgresos

  let saldoTracker = mOpen
  const movimientosConSaldo = [...caja.Movimientos]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((m) => {
      const monto = parseFloat(m.monto)
      m.tipoMovimiento === 'Ingreso' ? (saldoTracker += monto) : (saldoTracker -= monto)
      return { ...m, saldoAcumulado: saldoTracker }
    })
    .reverse()

  // --- CABECERA ---
  doc.setFillColor(colorAcento[0], colorAcento[1], colorAcento[2])
  doc.rect(0, 0, 210, 15, 'F')

  doc
    .setFont('helvetica', 'bold')
    .setFontSize(22)
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
  doc.text('AROMA DE ORO', 14, 30)

  doc.setFontSize(10).setTextColor(100).setFont('helvetica', 'normal')
  doc.text('AUDITORÍA DETALLADA DE CAJA Y MOVIMIENTOS', 14, 37)

  doc.setDrawColor(230).setFillColor(250).roundedRect(130, 22, 66, 25, 3, 3, 'FD')
  doc
    .setFontSize(8)
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
    .setFont('helvetica', 'bold')
  doc.text(`ID CAJA: #${caja.id.split('-')[0].toUpperCase()}`, 135, 28)
  doc.setFont('helvetica', 'normal').setTextColor(100)
  doc.text(`Apertura: ${new Date(caja.fechaApertura).toLocaleDateString('es-EC')}`, 135, 33)
  doc.text(
    `Cierre: ${caja.estado === 'Abierta' ? 'EN CURSO' : new Date(caja.fechaCierre).toLocaleDateString('es-EC')}`,
    135,
    38
  )
  doc.text(`Emisión: ${fechaFull}`, 135, 43)

  let currentY = 55

  // --- TABLA DE MOVIMIENTOS CON LÓGICA DE CONCEPTOS ---
  doc
    .setFontSize(11)
    .setFont('helvetica', 'bold')
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
  doc.text('HISTORIAL DE TRANSACCIONES', 14, currentY)
  currentY += 5

  autoTable(doc, {
    startY: currentY,
    head: [['HORA', 'CATEGORÍA', 'CONCEPTO / DETALLE', 'RESPONSABLE', 'MONTO', 'SALDO']],
    body: movimientosConSaldo.map((mov) => {
      // Aplicamos tu misma lógica de la tabla
      let tituloPrimario = mov.categoria
      let subtituloSecundario = mov.descripcion || 'Sin descripción'
      let usuarioNombre = 'Sistema'

      if (mov.categoria === 'Nomina') {
        tituloPrimario = 'PAGO DE NÓMINA'
        subtituloSecundario = mov.detalleNomina?.Persona?.nombreCompleto || mov.descripcion
        usuarioNombre = mov.detalleNomina?.Usuario?.nombresCompletos || 'Sistema'
      } else if (mov.categoria === 'Compra') {
        tituloPrimario = `COMPRA: ${mov.detalleCompra?.DetalleLiquidacion?.Producto?.nombre || 'INSUMOS'}`
        subtituloSecundario = `PROV: ${mov.detalleCompra?.Persona?.nombreCompleto || 'VARIOS'}`
        usuarioNombre = mov.detalleCompra?.Usuario?.nombresCompletos || 'Sistema'
      } else if (mov.categoria === 'Venta') {
        tituloPrimario = 'INGRESO DE VENTA'
        subtituloSecundario = `REF: ${mov.idReferencia?.slice(0, 8).toUpperCase() || 'N/A'}`
        usuarioNombre = mov.detalleVenta?.Usuario?.nombresCompletos || 'Sistema'
      }

      return [
        new Date(mov.fecha).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        tituloPrimario.toUpperCase(),
        subtituloSecundario.toUpperCase(),
        usuarioNombre.toUpperCase(),
        {
          content: `${mov.tipoMovimiento === 'Ingreso' ? '+' : '-'}${formatMoney(mov.monto)}`,
          styles: {
            textColor: mov.tipoMovimiento === 'Ingreso' ? [20, 83, 45] : [153, 27, 27],
            fontStyle: 'bold',
          },
        },
        formatMoney(mov.saldoAcumulado),
      ]
    }),
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 3 }, // Bajamos un poco el tamaño para que quepa el texto extra
    headStyles: { fillColor: colorEmpresa, halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'left' }, // Concepto detalle (crece automáticamente)
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
    },
  })

  // --- RESUMEN DE ARQUEO FINAL ---
  currentY = doc.lastAutoTable.finalY + 15
  if (currentY > 200) {
    doc.addPage()
    currentY = 20
  }

  doc
    .setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(colorEmpresa[0], colorEmpresa[1], colorEmpresa[2])
  doc.text('RESUMEN DE AUDITORÍA CONTABLE', 14, currentY)

  autoTable(doc, {
    startY: currentY + 5,
    margin: { left: 80 },
    tableWidth: 116,
    theme: 'plain',
    styles: {
      fontSize: 9.5,
      cellPadding: 5,
      font: 'helvetica',
      lineHeight: 1.4,
      textColor: [50, 50, 50],
    },
    body: [
      [
        { content: '(+) FONDO INICIAL DE APERTURA', styles: { halign: 'left', fontStyle: 'bold' } },
        { content: formatMoney(mOpen), styles: { halign: 'right' } },
      ],
      [
        { content: '(+) TOTAL INGRESOS', styles: { halign: 'left' } },
        { content: formatMoney(totalIngresos), styles: { halign: 'right' } },
      ],
      [
        { content: '(-) TOTAL EGRESOS', styles: { halign: 'left' } },
        {
          content: formatMoney(totalEgresos),
          styles: { halign: 'right', textColor: [153, 27, 27] },
        },
      ],
      [
        {
          content: '(=) SALDO ESPERADO EN CAJA',
          styles: { halign: 'left', fontStyle: 'bold', fillColor: [243, 244, 246] },
        },
        {
          content: formatMoney(saldoEsperado),
          styles: {
            halign: 'right',
            fontStyle: 'bold',
            fillColor: [243, 244, 246],
            textColor: [10, 80, 40],
          },
        },
      ],
      [
        {
          content: '',
          colSpan: 2,
          styles: { cellPadding: 1, borderBottom: { width: 0.5, color: [220, 220, 220] } },
        },
      ],
      [
        { content: 'MONTO REPORTADO (CIERRE FISICO)', styles: { halign: 'left' } },
        {
          content: caja.estado === 'Abierta' ? '---' : formatMoney(caja.montoCierre),
          styles: { halign: 'right' },
        },
      ],
      [
        {
          content: 'DIFERENCIA / DESCUADRE',
          styles: {
            halign: 'left',
            fillColor: colorEmpresa,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
        },
        {
          content: caja.estado === 'Abierta' ? 'EN CURSO' : formatMoney(caja.diferencia),
          styles: {
            halign: 'right',
            fillColor: colorEmpresa,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            ...(parseFloat(caja.diferencia) < 0 && { textColor: [255, 100, 100] }),
          },
        },
      ],
    ],
    columnStyles: { 0: { cellWidth: 76 }, 1: { cellWidth: 40, fontStyle: 'bold' } },
  })

  if (caja.estado !== 'Abierta') {
    const finalY = doc.lastAutoTable.finalY + 30
    doc.setDrawColor(200).line(30, finalY, 80, finalY)
    doc.line(130, finalY, 180, finalY)
    doc
      .setFontSize(8)
      .setTextColor(150)
      .text('FIRMA CAJERO RESPONSABLE', 36, finalY + 5)
    doc.text('FIRMA ADMINISTRADOR / REVISOR', 132, finalY + 5)
  }

  doc.save(`Reporte_Caja_${caja.id.split('-')[0].toUpperCase()}_${Date.now()}.pdf`)
}
