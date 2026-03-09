import { MdPayments, MdHourglassEmpty, MdCheckCircleOutline, MdSearch } from 'react-icons/md'
import { FaHistory, FaFileInvoiceDollar } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const CuentasPorPagar = () => {
  // Datos de ejemplo
  const deudasEjemplo = [
    {
      id: '1',
      LiquidacionId: 'LIQ-5501',
      montoTotal: 1200.5,
      montoAbonado: 200.5,
      saldoPendiente: 1000.0,
      estado: 'Pendiente',
      fechaAbono: '2026-03-05',
      fechaLimitePago: '2026-03-20',
      proveedor: 'Juan Pérez (Productor)',
    },
    {
      id: '2',
      LiquidacionId: 'LIQ-5502',
      montoTotal: 850.0,
      montoAbonado: 850.0,
      saldoPendiente: 0.0,
      estado: 'Pagado',
      fechaAbono: '2026-03-02',
      fechaLimitePago: '2026-03-10',
      proveedor: 'Asociación de Cacaoteros',
    },
  ]

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Cuentas por Pagar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Gestión de obligaciones y saldos pendientes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR LIQUIDACIÓN O PROVEEDOR..."
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA DE CUENTAS POR PAGAR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Liquidación / Beneficiario</th>
                  <th className="px-6 py-4 text-left">Total Deuda</th>
                  <th className="px-6 py-4 text-center">Abonado</th>
                  <th className="px-6 py-4 text-center">Saldo Restante</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {deudasEjemplo.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                          <FaFileInvoiceDollar size={18} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 leading-none uppercase tracking-tighter">
                            {item.LiquidacionId}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                            {item.proveedor}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-700 font-mono">
                        ${item.montoTotal.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-xs font-black text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                        +${item.montoAbonado.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`text-base font-black font-mono ${item.saldoPendiente > 0 ? 'text-amber-600' : 'text-gray-400'}`}
                      >
                        ${item.saldoPendiente.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.estado === 'Pagado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}
                      >
                        {item.estado === 'Pagado' ? (
                          <MdCheckCircleOutline size={14} />
                        ) : (
                          <MdHourglassEmpty size={14} />
                        )}
                        {item.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {item.saldoPendiente > 0 && (
                          <button className="flex items-center gap-1.5 bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 italic">
                            <MdPayments size={16} />
                            Abonar Pago
                          </button>
                        )}
                        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 cursor-pointer">
                          <FaHistory size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Registros Contables: {deudasEjemplo.length}
            </span>
            <div className="flex gap-6">
              <div className="text-[10px] font-black">
                <span className="text-gray-400 uppercase tracking-widest">Total Pendiente:</span>{' '}
                <span className="text-amber-600 ml-1 font-mono text-sm">$1,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorPagar
