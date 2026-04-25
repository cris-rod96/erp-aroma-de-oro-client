import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarKardexPDF = async (
  data,
  cajas,
  cajaId,
  filtroTipo,
  productos,
  filtroTiempo
) => {
  // Aviso de seguridad para grandes volúmenes
  if (data.length > 5000) {
    const confirm = await Swal.fire({
      title: 'GRAN VOLUMEN DE DATOS',
      text: `Estás procesando ${data.length} registros. El navegador podría tardar unos segundos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Generar de todos modos',
      cancelButtonText: 'Cancelar',
    })
    if (!confirm.isConfirmed) return
  }

  Swal.fire({
    title: 'Generando Reporte',
    text: `Espere un momento...`,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })

  // Pausa para que el navegador pinte el SweetAlert
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const doc = new jsPDF({ compress: true })
    const anchoPagina = 210
    const margen = 15

    // --- 1. LÓGICA DE FONDOS ---
    let fondoInicial = 0
    if (cajaId === 'todas') {
      const cajasOrdenadas = [...data].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      fondoInicial = parseFloat(cajasOrdenadas[0]?.Caja?.montoApertura || 0)
    } else {
      const cajaSeleccionada = data.find((m) => m.CajaId === cajaId)?.Caja
      fondoInicial = parseFloat(cajaSeleccionada?.montoApertura || 0)
    }

    // --- 2. PROCESAMIENTO POR LOTES (CHUNK) PARA EVITAR "PÁGINA NO RESPONDE" ---
    const resumen = { efIn: 0, efOut: 0, bnkOut: 0, cntIn: 0 }
    const filasDetail = []
    const chunkSize = 500

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)

      chunk.forEach((m) => {
        const monto = parseFloat(m.monto)
        const esBanco = m.descripcion?.includes('BANCO') || m.descripcion?.includes('CHEQUE')
        const esContable = m.CajaId === null
        const esEfectivo = !esBanco && !esContable

        // CORRECCIÓN AQUÍ: Usamos 'resumen' en lugar de 'acc'
        if (esEfectivo) {
          m.tipoMovimiento === 'Ingreso' ? (resumen.efIn += monto) : (resumen.efOut += monto)
        } else if (esBanco) {
          resumen.bnkOut += monto
        } else if (esContable) {
          resumen.cntIn += monto
        }

        const fecha = new Date(m.fecha).toLocaleString('es-EC', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })

        let detalle = m.descripcion || m.categoria
        if (m.detalleCompra) detalle = `COMPRA: ${m.detalleCompra.codigo}`

        filasDetail.push([
          fecha,
          m.categoria.toUpperCase(),
          esBanco ? 'BANCO' : esContable ? 'CONTABLE' : 'EFECTIVO',
          doc.splitTextToSize(detalle.toUpperCase(), 75),
          {
            content: `${m.tipoMovimiento === 'Ingreso' ? '+' : '-'}${formatMoney(monto)}`,
            styles: {
              textColor: m.tipoMovimiento === 'Ingreso' ? [0, 100, 0] : [150, 0, 0],
              fontStyle: 'bold',
            },
          },
        ])
      })

      // Liberar el hilo de ejecución por 10ms
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    const saldoActualFisico = fondoInicial + resumen.efIn - resumen.efOut

    // --- 3. DISEÑO DE CABECERA (SIN LOGO - DATOS EMPRESA) ---
    doc.setFillColor(28, 31, 38)
    doc.rect(0, 0, anchoPagina, 45, 'F')

    doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
    doc.text('AROMA DE ORO', margen, 15)
    doc.setFontSize(8).setTextColor(200).setFont('helvetica', 'normal')
    doc.text('EXPORTADORA AGRÍCOLA', margen, 20)
    doc.text('Guayaquil, Ecuador', margen, 24)
    doc.text(`REPORTE GENERADO: ${new Date().toLocaleString()}`, margen, 28)

    doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
    doc.text('KARDEX OPERATIVO', anchoPagina - margen, 22, { align: 'right' })
    doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
    doc.text(`FONDO BASE: ${formatMoney(fondoInicial)}`, anchoPagina - margen, 30, {
      align: 'right',
    })
    doc.text(`SALDO ACTUAL CAJA: ${formatMoney(saldoActualFisico)}`, anchoPagina - margen, 36, {
      align: 'right',
    })

    // --- 4. TABLA DE ARQUEO ---
    autoTable(doc, {
      startY: 50,
      margin: { left: margen, right: margen },
      head: [['DESCRIPCIÓN DE AUDITORÍA FÍSICA', 'VALORES']],
      body: [
        [`(+) FONDO BASE (${filtroTiempo.toUpperCase()})`, formatMoney(fondoInicial)],
        ['(+) INGRESOS EFECTIVO', formatMoney(resumen.efIn)],
        ['(-) EGRESOS EFECTIVO', formatMoney(resumen.efOut)],
        [
          {
            content: 'SALDO TOTAL ACTUAL (EFECTIVO EN MANO)',
            styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
          },
          {
            content: formatMoney(saldoActualFisico),
            styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
          },
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      columnStyles: { 1: { halign: 'right', cellWidth: 40 } },
    })

    // --- 5. MOVIMIENTOS BANCARIOS/CHEQUES ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      margin: { left: margen, right: margen },
      head: [['MOVIMIENTOS BANCARIOS / CONTABLES (EXTERNOS)', 'VALOR']],
      body: [
        ['SALIDAS POR BANCO (CHEQUES / TRANSFERENCIAS)', formatMoney(resumen.bnkOut)],
        ['CRUCES CONTABLES / OTROS', formatMoney(resumen.cntIn)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: { 1: { halign: 'right', cellWidth: 40 } },
    })

    // --- 6. DETALLE CRONOLÓGICO ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: margen, right: margen },
      head: [['FECHA', 'CATEGORÍA', 'MÉTODO', 'DETALLE', 'VALOR']],
      body: filasDetail,
      theme: 'grid',
      headStyles: { fillColor: [28, 31, 38], halign: 'center', fontSize: 8 },
      styles: { fontSize: 7, valign: 'middle' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 30 },
      },
    })

    doc.save(`KARDEX_AROMA_ORO_${Date.now().toString().slice(-4)}.pdf`)
    Swal.close()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Fallo al procesar el histórico masivo.', 'error')
  }
}
