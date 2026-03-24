import { useEffect } from 'react'
import { MdAccountBalanceWallet, MdAccountBalance, MdPayments } from 'react-icons/md'

const KardexTable = ({ data, productos }) => {
  useEffect(() => {
    console.log(productos)
  }, [productos])
  const obtenerDetalleRelativo = (m) => {
    // 1. CASO COMPRAS (Basado en el objeto que pasaste: detalleCompra)
    if (m.categoria === 'Compra' && m.detalleCompra) {
      const codigo = m.detalleCompra.codigo || 'CMP'
      // Buscamos el producto si existe el ID, sino usamos la descripción
      const prod = m.detalleCompra?.DetalleLiquidacion?.Producto?.nombre || ''
      return `${codigo} ${prod ? '| ' + prod : ''}`.toUpperCase()
    }

    // 2. CASO BANCOS / RETIROS
    if (m.categoria === 'Bancos' && m.descripcion) {
      return m.descripcion.toUpperCase()
    }

    // 3. CASO VENTAS
    if (m.categoria === 'Venta' && m.detalleVenta) {
      const codigo = m.detalleVenta.codigoVenta || 'VNT'
      const prod = m.detalleVenta?.Producto?.nombre || ''
      return `${codigo} | ${prod}`.toUpperCase()
    }

    // 4. CASO GASTOS GENERALES
    if (m.detalleGasto) {
      const catGasto = m.detalleGasto.categoria || ''
      const descGasto = m.detalleGasto.descripcion || ''
      return `${catGasto}: ${descGasto}`.toUpperCase()
    }

    // 5. CASO NÓMINA
    if (m.detalleNomina) {
      return `PAGO A: ${m.detalleNomina.Persona?.nombresCompletos || 'PERSONAL'}`.toUpperCase()
    }

    return (m.descripcion || m.categoria || 'SIN DETALLE').toUpperCase()
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden font-sans">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <th className="px-6 py-5 text-left">Fecha / Hora</th>
            <th className="px-6 py-5 text-left">Concepto</th>
            <th className="px-6 py-5 text-left">Detalle / Operación</th>
            <th className="px-6 py-5 text-center">Mov. Caja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {data.length > 0 ? (
            data.map((m) => {
              // --- LÓGICA DE DETECCIÓN BASADA EN TU OBJETO ---
              const esBanco = m.descripcion?.includes('BANCO') || m.descripcion?.includes('CHEQUE')
              const esContable = m.CajaId === null // Como el "Cobro Anticipo" que me mostraste
              const esEfectivo = !esBanco && !esContable

              return (
                <tr
                  key={m.id}
                  className={`hover:bg-amber-50/20 transition-colors group text-xs font-bold uppercase ${!esEfectivo ? 'opacity-70' : ''}`}
                >
                  <td className="px-6 py-4 text-gray-400 font-mono">
                    {new Date(m.fecha).toLocaleString('es-EC', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1 h-6 rounded-full ${
                          esContable
                            ? 'bg-blue-400'
                            : esBanco
                              ? 'bg-indigo-500'
                              : m.tipoInterfaz === 'inventario'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                        }`}
                      ></div>
                      <div>
                        <span className="text-gray-800 block leading-none">{m.categoria}</span>
                        {esBanco && (
                          <span className="text-[7px] text-indigo-600 font-black tracking-tighter uppercase">
                            Salida Bancaria
                          </span>
                        )}
                        {esContable && (
                          <span className="text-[7px] text-blue-500 font-black tracking-tighter uppercase">
                            Ajuste Contable
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 leading-tight">
                    {obtenerDetalleRelativo(m)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div
                      className={`flex flex-col items-center ${m.tipoMovimiento === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      <span className="font-black text-sm">
                        {m.tipoMovimiento === 'Ingreso' ? '+' : '-'}$
                        {parseFloat(m.monto).toFixed(2)}
                      </span>

                      {/* INDICADOR DE NO AFECTACIÓN FÍSICA */}
                      {!esEfectivo && (
                        <div className="flex items-center gap-1 text-[8px] text-gray-400 uppercase mt-0.5 font-black bg-gray-100 px-1.5 py-0.5 rounded">
                          {esBanco ? <MdAccountBalance size={10} /> : <MdPayments size={10} />}
                          No resta efectivo
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td
                colSpan="4"
                className="px-6 py-20 text-center text-gray-300 font-black uppercase italic"
              >
                No se encontraron registros
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer Informativo */}
      <div className="bg-gray-900 px-8 py-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <MdAccountBalanceWallet className="text-emerald-400" size={24} />
          <div>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">
              Resumen Operativo
            </p>
            <p className="text-lg font-black mt-1">{data.length} Transacciones</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-gray-600 uppercase italic bg-black/30 px-4 py-1.5 rounded-full border border-gray-800">
          Aroma de Oro | Análisis de Liquidez
        </div>
      </div>
    </div>
  )
}

export default KardexTable
