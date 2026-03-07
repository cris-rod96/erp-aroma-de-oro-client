import { Container } from '../../components/index.components'
import { NavLink } from 'react-router-dom'
import { MdAccountBalanceWallet, MdAccessTime, MdArrowForward } from 'react-icons/md'

const Cajas = () => {
  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">Control de Cajas</h1>
            <p className="text-gray-500 text-sm">
              Historial de aperturas, cierres y flujos de efectivo.
            </p>
          </div>

          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
            <MdAccountBalanceWallet size={20} /> Abrir Nueva Caja
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* --- VISTA DESKTOP --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    N° Caja
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Tiempos (Apertura/Cierre)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Balances
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest underline italic text-blue-500">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black border border-indigo-100">
                      1
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-700 font-medium">
                      A: <span className="text-gray-400">2026-04-03 07:00</span>
                    </div>
                    <div className="text-xs text-gray-700 font-medium mt-1">
                      C: <span className="text-gray-400">2026-04-03 17:00</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-gray-500">
                      Inicial: <span className="text-gray-900">$1,500.00</span>
                    </div>
                    <div className="text-sm font-black text-indigo-600">Final: $12,000.00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-tighter">
                      Cerrada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <NavLink className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center justify-end gap-1 group">
                      VER DETALLE{' '}
                      <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL (TIPO CARD FINANCIERA) --- */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="p-5 flex flex-col gap-4 bg-white">
              {/* Encabezado: Número y Estado */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black">
                    #1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">CAJA DIARIA</h3>
                    <span className="text-[10px] font-bold text-gray-400">ID: CAJ-004-2026</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                  CERRADA
                </span>
              </div>

              {/* Grid de Dinero */}
              <div className="grid grid-cols-2 gap-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase">Apertura</p>
                  <p className="text-sm font-bold text-gray-700">$1,500.00</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-400 uppercase">Cierre Total</p>
                  <p className="text-base font-black text-indigo-700">$12,000.00</p>
                </div>
              </div>

              {/* Tiempos y Detalles */}
              <div className="flex justify-between items-center text-[11px] px-1">
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <MdAccessTime size={14} className="text-indigo-400" />
                  07:00 AM - 05:00 PM
                </div>
                <NavLink
                  to="/detalle"
                  className="text-indigo-600 font-black flex items-center gap-1 italic underline"
                >
                  VER DETALLE
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Cajas
