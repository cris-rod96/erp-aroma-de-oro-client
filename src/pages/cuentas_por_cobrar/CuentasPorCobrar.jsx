import { MdPayments, MdCalendarToday, MdAttachMoney, MdReceipt, MdSearch } from 'react-icons/md'
import { FaHistory } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const CuentasPorCobrar = () => {
  // Datos de ejemplo
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
      <div className="w-full px-4 md:px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Cuentas por Cobrar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Seguimiento de saldos, abonos y vencimientos de ventas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR VENTA O CLIENTE..."
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* TABLA PROFESIONAL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
                  <tr key={cuenta.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Referencia */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                          <MdReceipt size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 leading-none uppercase tracking-tighter">
                            {cuenta.VentaId}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                            {cuenta.cliente}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Detalle Montos */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                          Total Venta
                        </span>
                        <span className="text-sm font-black text-gray-700 font-mono">
                          ${cuenta.montoTotal.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Abonos */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 uppercase">
                        <MdAttachMoney size={14} />
                        {cuenta.abonoAnticipado.toFixed(2)}
                      </div>
                    </td>

                    {/* Saldo Pendiente */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-base font-black text-amber-600 font-mono">
                        ${cuenta.montoPorCobrar.toFixed(2)}
                      </div>
                    </td>

                    {/* Fecha Límite */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MdCalendarToday size={16} className="text-amber-500" />
                        <div className="text-xs font-bold font-mono">{cuenta.fechaLimite}</div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1.5 bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 italic">
                          <MdPayments size={16} />
                          Registrar Cobro
                        </button>
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

          {/* Footer de resumen rápido */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Facturas por Cobrar: {cuentasEjemplo.length}
            </span>
            <div className="text-[10px] font-black">
              <span className="text-gray-400 uppercase tracking-widest">Cartera Total:</span>{' '}
              <span className="text-amber-600 ml-1 font-mono text-sm">$3,300.00</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CuentasPorCobrar
