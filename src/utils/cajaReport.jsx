import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'
import { formatMoney } from './fromatters'

export const exportarCajaDetallePDF = async (caja, empresa) => {
  Swal.fire({
    title: 'Generando Reporte',
    text: 'Espere un momento....',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  })

  setTimeout(async () => {
    try {
      const movs = caja.Movimientos || []

      // --- 1. LÓGICA DE FILTRADO (EFECTIVO VS VIRTUAL) ---
      let efIn = 0,
        efOut = 0,
        efInyeccion = 0,
        bnkIn = 0,
        bnkOut = 0

      movs.forEach((m) => {
        const monto = parseFloat(m.monto)
        const desc = m.descripcion?.toUpperCase() || ''
        const cat = m.categoria?.toUpperCase() || ''

        // Prioridad absoluta: Si dice INYECCION, es efectivo para la caja física
        const esInyeccion = desc.toUpperCase().includes('INYECCIÓN')

        // Es virtual si menciona bancos/transf/cheque PERO no es una inyección
        const esVirtual =
          (desc.includes('BANCO') ||
            desc.includes('CHEQUE') ||
            desc.includes('TRANSF') ||
            cat.includes('BANCO')) &&
          !esInyeccion

        const esIngreso = m.tipoMovimiento === 'Ingreso'

        if (esVirtual) {
          esIngreso ? (bnkIn += monto) : (bnkOut += monto)
        } else {
          if (esIngreso) {
            if (esInyeccion) {
              efInyeccion += monto // Aquí caen los 5000 si pones "Inyección: Dinero para caja"
            } else {
              efIn += monto // Aquí quedan los 6650 (Ventas, etc.)
            }
          } else {
            efOut += monto
          }
        }
      })

      const montoEsperadoFisico = parseFloat(caja.montoApertura) + efIn + efInyeccion - efOut
      const montoCierreReportado = parseFloat(caja.montoCierre || 0)
      const diferenciaArqueo = montoCierreReportado - montoEsperadoFisico

      const doc = new jsPDF({ compress: true })
      const anchoPagina = 210
      const margen = 15

      // --- 2. CABECERA ---
      doc.setFillColor(28, 31, 38)
      doc.rect(0, 0, anchoPagina, 45, 'F')

      doc.setFontSize(14).setTextColor(230, 160, 0).setFont('helvetica', 'bold')
      doc.text((empresa?.nombre || 'AROMA DE ORO').toUpperCase(), margen, 15)

      doc.setFontSize(8).setTextColor(200).setFont('helvetica', 'normal')
      doc.text(empresa?.ruc ? `RUC: ${empresa.ruc}` : 'EXPORTADORA AGRÍCOLA', margen, 20)
      doc.text(empresa?.direccion || 'Guayaquil, Ecuador', margen, 24)
      doc.text(empresa?.telefono ? `TEL: ${empresa.telefono}` : '', margen, 28)
      doc.text(
        `RESPONSABLE: ${(caja.Usuario?.nombresCompletos || 'SISTEMA').toUpperCase()}`,
        margen,
        33
      )

      doc.setFontSize(18).setTextColor(255).setFont('helvetica', 'bold')
      doc.text('INFORME DE ARQUEO', anchoPagina - margen, 20, { align: 'right' })

      doc.setFontSize(9).setTextColor(200).setFont('helvetica', 'normal')
      doc.text(`CAJA ID: ${caja.id.split('-')[0].toUpperCase()}`, anchoPagina - margen, 28, {
        align: 'right',
      })
      doc.text(`ESTADO: ${caja.estado.toUpperCase()}`, anchoPagina - margen, 33, { align: 'right' })
      doc.text(`CIERRE: ${new Date().toLocaleString()}`, anchoPagina - margen, 38, {
        align: 'right',
      })

      // --- 3. TABLA DE AUDITORÍA FÍSICA ---
      autoTable(doc, {
        startY: 50,
        margin: { left: margen, right: margen },
        head: [['DESCRIPCIÓN DE AUDITORÍA FÍSICA', 'VALORES']],
        body: [
          ['(+) FONDO INICIAL DE APERTURA', formatMoney(caja.montoApertura)],
          ['(+) TOTAL INGRESOS EFECTIVO (VENTAS/RECAUDO)', formatMoney(efIn)],
          ['(+) INYECCIONES DE CAPITAL / CAJA', formatMoney(efInyeccion)],
          ['(-) TOTAL EGRESOS EFECTIVO', `-${formatMoney(efOut)}`],
          [
            {
              content: 'SALDO TOTAL ACTUAL (EFECTIVO EN MANO)',
              styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
            },
            {
              content: formatMoney(montoEsperadoFisico),
              styles: { fontStyle: 'bold', fillColor: [230, 160, 0], textColor: 255 },
            },
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        columnStyles: { 1: { halign: 'right', cellWidth: 45 } },
      })

      // --- 4. CONCILIACIÓN DE CIERRE ---
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        margin: { left: margen, right: margen },
        head: [['MONTO ESPERADO (SISTEMA)', 'MONTO REPORTADO (CONTEO)', 'DIFERENCIA']],
        body: [
          [
            formatMoney(montoEsperadoFisico),
            formatMoney(montoCierreReportado),
            {
              content: formatMoney(diferenciaArqueo),
              styles: {
                textColor: diferenciaArqueo < 0 ? [200, 0, 0] : [0, 100, 0],
                fontStyle: 'bold',
              },
            },
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [28, 31, 38], halign: 'center' },
        styles: { halign: 'center', fontSize: 10 },
      })

      // --- 5. MOVIMIENTOS BANCARIOS ---
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        margin: { left: margen, right: margen },
        head: [['MOVIMIENTOS VIRTUALES / BANCOS (NO AFECTAN CAJA FÍSICA)', 'VALOR']],
        body: [
          ['(+) TOTAL INGRESOS BANCARIOS', formatMoney(bnkIn)],
          ['(-) TOTAL SALIDAS (CHEQUES / TRANSFERENCIAS)', `-${formatMoney(bnkOut)}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [100, 116, 139] },
        columnStyles: { 1: { halign: 'right', cellWidth: 45 } },
      })

      // --- 6. DETALLE CRONOLÓGICO ---
      const bodyMovs = movs.map((m) => {
        const val = parseFloat(m.monto)
        const isIn = m.tipoMovimiento === 'Ingreso'
        const descU = m.descripcion?.toUpperCase() || ''
        const catU = m.categoria?.toUpperCase() || ''

        const esIny = descU.includes('INYECCION')
        const isVirtual =
          (descU.includes('BANCO') ||
            descU.includes('CHEQUE') ||
            descU.includes('TRANSF') ||
            catU.includes('BANCO')) &&
          !esIny

        return [
          new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          catU,
          isVirtual ? 'BANCO' : 'EFECTIVO',
          doc.splitTextToSize(descU || catU, 70),
          {
            content: `${isIn ? '+' : '-'}${formatMoney(val)}`,
            styles: { textColor: isIn ? [0, 100, 0] : [150, 0, 0], fontStyle: 'bold' },
          },
        ]
      })

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: margen, right: margen },
        head: [['HORA', 'CATEGORÍA', 'MÉTODO', 'DETALLE', 'MONTO']],
        body: bodyMovs,
        theme: 'grid',
        headStyles: { fillColor: [28, 31, 38], halign: 'center', fontSize: 8 },
        styles: { fontSize: 7, valign: 'middle' },
        columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 4: { halign: 'right' } },
      })

      doc.save(`ARQUEO_${caja.id.split('-')[0].toUpperCase()}.pdf`)
      Swal.close()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Fallo al generar reporte', 'error')
    }
  }, 150)
}
