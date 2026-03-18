import { MdAccountBalanceWallet } from 'react-icons/md'

const KardexTable = ({ data, productos }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <th className="px-6 py-5 text-left">Fecha / Hora</th>
            <th className="px-6 py-5 text-left">Concepto</th>
            <th className="px-6 py-5 text-left">Detalle / Producto</th>
            <th className="px-6 py-5 text-center">Mov. Caja</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {data.length > 0 ? (
            data.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-amber-50/20 transition-colors group text-xs font-bold uppercase"
              >
                <td className="px-6 py-4 text-gray-400 font-mono">
                  {new Date(m.fecha).toLocaleString('es-EC')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1 h-6 rounded-full ${m.tipoInterfaz === 'inventario' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    ></div>
                    <span className="text-gray-800">{m.categoria}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {m.tipoInterfaz === 'inventario'
                    ? productos.find((p) => p.id === m.ProductoId)?.nombre || 'S/N'
                    : m.detalleNomina?.Persona?.nombresCompletos || 'GASTO GENERAL'}
                </td>
                <td
                  className={`px-6 py-4 text-center font-black ${m.tipoMovimiento === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {m.tipoMovimiento === 'Ingreso' ? '+' : '-'}${parseFloat(m.monto).toFixed(2)}
                </td>
              </tr>
            ))
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

      {/* Footer de la Tabla */}
      <div className="bg-gray-900 px-8 py-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <MdAccountBalanceWallet className="text-emerald-400" size={24} />
          <div>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">
              Flujo de Caja
            </p>
            <p className="text-lg font-black mt-1">{data.length} Registros</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-gray-600 uppercase italic bg-black/30 px-4 py-1.5 rounded-full border border-gray-800">
          Aroma de Oro | ERP v1.0
        </div>
      </div>
    </div>
  )
}

export default KardexTable
