import { MdPayments, MdCalendarToday, MdHourglassEmpty, MdCheckCircleOutline } from 'react-icons/md'
import { FaHistory, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const CuentasPorPagar = () => {
  // Datos de ejemplo basados en tu modelo de Sequelize (Liquidacions)
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
      <div className="w-full px-4 md:px-8">
        {/* CABECERA (Consistente con Nómina) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Cuentas por Pagar</h1>
            <p className="text-gray-500 text-sm">
              Gestión de obligaciones pendientes con productores y proveedores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Buscar liquidación o proveedor..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA DE CUENTAS POR PAGAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
                    {/* Liquidación e Identidad */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                          <FaFileInvoiceDollar size={18} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 leading-none">
                            {item.LiquidacionId}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium mt-1 uppercase italic">
                            {item.proveedor}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Monto Total */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-700 font-mono">
                        ${item.montoTotal.toFixed(2)}
                      </div>
                    </td>

                    {/* Monto Abonado */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-emerald-600 font-mono bg-emerald-50 px-2 py-1 rounded-lg inline-block">
                        +${item.montoAbonado.toFixed(2)}
                      </div>
                    </td>

                    {/* Saldo Pendiente */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`text-base font-black font-mono ${item.saldoPendiente > 0 ? 'text-orange-600' : 'text-gray-400'}`}
                      >
                        ${item.saldoPendiente.toFixed(2)}
                      </div>
                    </td>

                    {/* Estado con Badge Dinámico */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          item.estado === 'Pagado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700 animate-pulse'
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

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {item.saldoPendiente > 0 && (
                          <button className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                            <MdPayments size={16} />
                            ABONAR PAGO
                          </button>
                        )}
                        <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100">
                          <FaHistory size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer de la tabla para info rápida */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Mostrando {deudasEjemplo.length} registros contables
            </span>
            <div className="flex gap-4">
              <div className="text-[10px] font-bold">
                <span className="text-gray-400">TOTAL POR PAGAR:</span>{' '}
                <span className="text-orange-600 ml-1 font-mono text-sm">$1,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorPagar
