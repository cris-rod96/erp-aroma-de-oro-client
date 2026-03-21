import { MdPrint, MdVisibility } from 'react-icons/md'
import { exportarLiquidacionPDF } from '../../utils/liquidacionReport'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const ComprasTable = ({ liquidaciones, setSelectedLiq, setShowModal }) => {
  const empresa = useEmpresaStore((store) => store.empresa)
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 text-sm">
          <thead className="bg-gray-50/80 backdrop-blur-md">
            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 border-b border-gray-100">Expediente</th>
              <th className="px-6 py-4 border-b border-gray-100">Productor</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">Peso Neto</th>
              <th className="px-6 py-4 border-b border-gray-100 text-right">Total Neto</th>
              <th className="px-6 py-4 border-b border-gray-100 text-right text-emerald-600">
                Abonado
              </th>
              <th className="px-6 py-4 border-b border-gray-100 text-right">Saldo</th>
              <th className="px-6 py-4 border-b border-gray-100 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {liquidaciones.map((liq) => (
              <tr key={liq.id} className="hover:bg-blue-50/30 transition-all duration-200">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 leading-tight">{liq.codigo}</div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {new Date(liq.createdAt).toLocaleDateString('es-EC')}
                  </div>
                </td>

                <td className="px-6 py-4 font-semibold text-gray-700 italic">
                  {liq.Persona?.nombreCompleto}
                </td>

                <td className="px-6 py-4 text-center font-mono font-bold text-blue-600">
                  {parseFloat(liq.DetalleLiquidacion?.cantidadNeta).toFixed(2)}
                  <span className="text-[9px] text-gray-400 ml-1">QQ</span>
                </td>

                {/* TOTAL DE LA LIQUIDACIÓN */}
                <td className="px-6 py-4 text-right font-black text-gray-900">
                  ${parseFloat(liq.totalAPagar).toFixed(2)}
                </td>

                {/* NUEVA COLUMNA: TOTAL ABONADO */}
                <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 bg-emerald-50/20">
                  ${parseFloat(liq.montoAbonado || 0).toFixed(2)}
                </td>

                {/* SALDO PENDIENTE CON BADGE DINÁMICO */}
                <td className="px-6 py-4 text-right">
                  {parseFloat(liq.montoPorPagar) > 0 ? (
                    <div className="inline-flex flex-col items-end">
                      <span className="text-[10px] font-black text-orange-600 font-mono">
                        ${parseFloat(liq.montoPorPagar).toFixed(2)}
                      </span>
                      <span className="flex items-center text-[8px] font-black text-orange-400 uppercase">
                        <span className="w-1 h-1 rounded-full bg-orange-400 mr-1 animate-pulse"></span>
                        Pendiente
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                      Liquidado
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLiq(liq)
                        setShowModal(true)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white border border-indigo-100 transition-all shadow-sm group/btn"
                    >
                      <MdVisibility
                        size={16}
                        className="group-hover/btn:scale-110 transition-transform"
                      />
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        Ver Detalle
                      </span>
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      onClick={() => exportarLiquidacionPDF(liq, empresa)}
                    >
                      <MdPrint size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComprasTable
