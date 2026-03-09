import { useState } from 'react'
import { Container, Modal } from '../../components/index.components'
import { NavLink } from 'react-router-dom'
import {
  MdAccountBalanceWallet,
  MdAccessTime,
  MdArrowForward,
  MdAttachMoney,
  MdNotes,
} from 'react-icons/md'

const Cajas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* ENCABEZADO DE PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Control de Cajas
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Historial de aperturas, cierres y flujos de efectivo
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <MdAccountBalanceWallet size={18} /> Abrir Nueva Caja
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* --- VISTA DESKTOP --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    N° Caja
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Tiempos (Apertura/Cierre)
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Balances
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="h-8 w-8 rounded-lg bg-gray-900 text-amber-400 flex items-center justify-center font-black border border-gray-800 shadow-sm">
                      1
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-700 font-bold uppercase">
                      A: <span className="text-gray-500 font-mono">2026-04-03 07:00</span>
                    </div>
                    <div className="text-xs text-gray-700 font-bold uppercase mt-1">
                      C: <span className="text-gray-500 font-mono">2026-04-03 17:00</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[10px] font-black text-gray-400 uppercase">
                      Inicial: <span className="text-gray-900">$1,500.00</span>
                    </div>
                    <div className="text-sm font-black text-amber-600">Final: $12,000.00</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 uppercase">
                      Cerrada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <NavLink className="text-gray-400 hover:text-gray-900 text-[10px] font-black flex items-center justify-end gap-1 group uppercase tracking-widest">
                      Ver Detalle
                      <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL --- */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="p-5 flex flex-col gap-4 bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black shadow-md">
                    #1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                      Caja Diaria
                    </h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      ID: CAJ-004-2026
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[9px] font-black bg-red-50 text-red-700 border border-red-100 uppercase">
                  Cerrada
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Apertura
                  </p>
                  <p className="text-sm font-bold text-gray-700">$1,500.00</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                    Cierre Total
                  </p>
                  <p className="text-base font-black text-gray-900">$12,000.00</p>
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  <MdAccessTime size={14} className="text-amber-500" />
                  07:00 AM - 05:00 PM
                </div>
                <NavLink
                  to="/detalle"
                  className="text-gray-900 font-black text-[10px] flex items-center gap-1 uppercase tracking-widest italic"
                >
                  Ver Detalle
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL APERTURA DE CAJA --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Abrir Nueva Caja">
        <form className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Monto Inicial de Apertura
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdAttachMoney className="text-amber-500 mr-2" size={24} />
              <input
                type="number"
                placeholder="0.00"
                className="bg-transparent w-full outline-none text-lg font-black text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Observaciones de Apertura
            </label>
            <div className="flex items-start py-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdNotes className="text-amber-500 mr-3 mt-1" size={20} />
              <textarea
                placeholder="Notas sobre el estado del efectivo inicial..."
                rows="3"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95 italic"
            >
              Confirmar Apertura
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Cajas
