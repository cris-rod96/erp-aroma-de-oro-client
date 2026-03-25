import { useState, useEffect } from 'react'
import {
  MdAccountBalanceWallet,
  MdAccountBalance,
  MdPayments,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md'

const KardexTable = ({ fetching, data, error }) => {
  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentData = data?.slice(indexOfFirstItem, indexOfLastItem) || []
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear a pág 1 si cambian los filtros o la data
  useEffect(() => {
    setCurrentPage(1)
  }, [data?.length])

  const obtenerDetalleRelativo = (m) => {
    if (m.categoria === 'Compra' && m.detalleCompra) {
      const codigo = m.detalleCompra.codigo || 'CMP'
      const prod = m.detalleCompra?.DetalleLiquidacion?.Producto?.nombre || ''
      return `${codigo} ${prod ? '| ' + prod : ''}`.toUpperCase()
    }
    if (m.categoria === 'Bancos' && m.descripcion) return m.descripcion.toUpperCase()
    if (m.categoria === 'Venta' && m.detalleVenta) {
      const codigo = m.detalleVenta.codigoVenta || 'VNT'
      const prod = m.detalleVenta?.Producto?.nombre || ''
      return `${codigo} | ${prod}`.toUpperCase()
    }
    if (m.detalleGasto) {
      return `${m.detalleGasto.categoria || ''}: ${m.detalleGasto.descripcion || ''}`.toUpperCase()
    }
    if (m.detalleNomina) {
      return `PAGO A: ${m.detalleNomina.Persona?.nombresCompletos || 'PERSONAL'}`.toUpperCase()
    }
    return (m.descripcion || m.categoria || 'SIN DETALLE').toUpperCase()
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden font-sans flex flex-col">
      <div className="overflow-x-auto">
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
            {fetching ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-20 text-center animate-pulse font-black text-gray-300 uppercase text-xs"
                >
                  Cargando historial...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MdSecurity size={50} className="text-rose-400 mb-4" />
                    <h3 className="text-rose-600 font-black uppercase text-sm tracking-widest">
                      Acceso Restringido
                    </h3>
                    <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase">{error}</p>
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((m) => {
                const esBanco =
                  m.descripcion?.includes('BANCO') || m.descripcion?.includes('CHEQUE')
                const esContable = m.CajaId === null
                const esEfectivo = !esBanco && !esContable

                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-amber-50/20 transition-colors group text-xs font-bold uppercase ${!esEfectivo ? 'opacity-75' : ''}`}
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono">
                      {new Date(m.fecha).toLocaleString('es-EC', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1 h-6 rounded-full ${esContable ? 'bg-blue-400' : esBanco ? 'bg-indigo-500' : m.tipoInterfaz === 'inventario' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        ></div>
                        <div>
                          <span className="text-gray-800 block leading-none">{m.categoria}</span>
                          {esBanco && (
                            <span className="text-[7px] text-indigo-600 font-black tracking-tighter">
                              Salida Bancaria
                            </span>
                          )}
                          {esContable && (
                            <span className="text-[7px] text-blue-500 font-black tracking-tighter">
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
                        {!esEfectivo && (
                          <div className="flex items-center gap-1 text-[8px] text-gray-400 uppercase mt-0.5 font-black bg-gray-100 px-1.5 py-0.5 rounded">
                            {esBanco ? <MdAccountBalance size={10} /> : <MdPayments size={10} />} No
                            afecta físico
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
      </div>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {data.length > itemsPerPage && (
        <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Página <span className="text-gray-900">{currentPage}</span> de{' '}
            <span className="text-gray-900">{totalPages}</span> — {data.length} movimientos
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-amber-400 hover:text-amber-600 transition-all"
            >
              <MdChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)]
                .map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                      currentPage === i + 1
                        ? 'bg-gray-900 text-amber-400 shadow-lg border-b-2 border-amber-600'
                        : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-amber-400 hover:text-amber-600 transition-all"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Informativo */}
      <div className="bg-gray-900 px-8 py-6 flex flex-col md:flex-row justify-between items-center text-white gap-4">
        <div className="flex items-center gap-3">
          <MdAccountBalanceWallet className="text-emerald-400" size={24} />
          <div>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">
              Resumen Operativo
            </p>
            <p className="text-lg font-black mt-1 tracking-tighter">
              {data.length} Transacciones en Sistema
            </p>
          </div>
        </div>
        <div className="text-[10px] font-black text-gray-500 uppercase italic bg-black/40 px-5 py-2 rounded-2xl border border-white/5 tracking-[0.2em]">
          Aroma de Oro | Análisis de Liquidez
        </div>
      </div>
    </div>
  )
}

export default KardexTable
