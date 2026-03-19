import { MdArrowForward, MdInbox } from 'react-icons/md'
import { formatFecha, formatMoney } from '../../utils/fromatters'
import { NavLink } from 'react-router-dom'

const CajasTable = ({ fetching, cajas }) => {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Apertura / N°</th>
                <th className="px-6 py-4 text-right">Fondo Inicial</th>
                <th className="px-6 py-4 text-right">Monto Cierre</th>
                <th className="px-6 py-4 text-right bg-gray-200/50">Diferencia</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center animate-pulse font-black text-gray-300 uppercase text-xs"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : cajas.length > 0 ? (
                cajas.map((caja, index) => (
                  <tr key={caja.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-400 text-[10px]">
                        #{cajas.length - index}
                      </div>
                      <div className="text-[12px] font-bold text-gray-700 font-mono">
                        {formatFecha(caja.fechaApertura)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-gray-900">
                      {formatMoney(caja.montoApertura)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                      {caja.estado === 'Abierta' ? '---' : formatMoney(caja.montoCierre)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-black ${
                        !caja.diferencia || parseFloat(caja.diferencia) === 0
                          ? 'text-gray-400'
                          : parseFloat(caja.diferencia) > 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                      }`}
                    >
                      {caja.estado === 'Abierta' ? 'En curso' : formatMoney(caja.diferencia)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          caja.estado === 'Abierta'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                      >
                        {caja.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <NavLink className="text-amber-600 hover:text-amber-900 text-[10px] font-black flex items-center justify-end gap-1 uppercase tracking-widest transition-colors italic">
                        Detalle <MdArrowForward />
                      </NavLink>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <MdInbox size={48} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-500 font-black uppercase text-xs">Sin registros</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CajasTable
