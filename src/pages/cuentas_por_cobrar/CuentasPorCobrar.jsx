import { MdPayments, MdCalendarToday, MdAttachMoney, MdReceipt } from 'react-icons/md'
import { FaHistory, FaSearch } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const CuentasPorCobrar = () => {
  // Datos de ejemplo basados en tu modelo de Sequelize
  const cuentasEjemplo = [
    {
      id: '1',
      VentaId: 'V-1001',
      montoTotal: 1500.0,
      montoPorCobrar: 500.0,
      abonoAnticipado: 1000.0,
      fecha: '2026-03-01',
      fechaLimite: '2026-03-15',
      cliente: 'Exportadora Cacao S.A.',
    },
    {
      id: '2',
      VentaId: 'V-1002',
      montoTotal: 2800.0,
      montoPorCobrar: 2800.0,
      abonoAnticipado: 0.0,
      fecha: '2026-03-05',
      fechaLimite: '2026-03-10',
      cliente: 'AgroIndustrias del Norte',
    },
  ]

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8">
        {/* CABECERA (Estilo Nómina) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Cuentas por Cobrar</h1>
            <p className="text-gray-500 text-sm">
              Seguimiento de saldos pendientes, abonos y vencimientos de ventas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Buscar venta o cliente..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all w-64 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA PROFESIONAL (Estilo Nómina) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Referencia Venta</th>
                  <th className="px-6 py-4 text-left">Detalle Montos</th>
                  <th className="px-6 py-4 text-center">Abonos</th>
                  <th className="px-6 py-4 text-center">Saldo Pendiente</th>
                  <th className="px-6 py-4 text-left">Vencimiento</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {cuentasEjemplo.map((cuenta) => (
                  <tr key={cuenta.id} className="hover:bg-indigo-50/30 transition-colors group">
                    {/* Referencia */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <MdReceipt size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 leading-none">
                            {cuenta.VentaId}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                            {cuenta.cliente}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Detalle Montos */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          Total Venta
                        </span>
                        <span className="text-sm font-bold text-gray-700 font-mono">
                          ${cuenta.montoTotal.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Abonos */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <MdAttachMoney size={14} />
                        {cuenta.abonoAnticipado.toFixed(2)}
                      </div>
                    </td>

                    {/* Saldo Pendiente (Resaltado) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-base font-black text-red-600 font-mono">
                        ${cuenta.montoPorCobrar.toFixed(2)}
                      </div>
                    </td>

                    {/* Fecha Límite */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MdCalendarToday size={16} className="text-gray-400" />
                        <div className="text-xs font-bold">{cuenta.fechaLimite}</div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-indigo-700 transition-all shadow-sm">
                          <MdPayments size={14} />
                          REGISTRAR COBRO
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all border border-gray-100">
                          <FaHistory size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorCobrar
