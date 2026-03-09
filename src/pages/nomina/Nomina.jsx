import { useState } from 'react'
import { FaUserEdit, FaHistory, FaPlus, FaUserTie } from 'react-icons/fa'
import { MdDelete, MdPayments, MdBadge, MdPhone, MdPerson } from 'react-icons/md'
import { Container, Modal } from '../../components/index.components'

const Nomina = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const handleOpenModal = (edit = false) => {
    setIsEdit(edit)
    setIsModalOpen(true)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* ENCABEZADO DE PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Gestión de Nómina
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Control de jornales, pagos y registro de empleados
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <FaPlus size={14} />
            Nuevo Empleado
          </button>
        </div>

        {/* TABLA DE NÓMINA */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Empleado
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Identificación
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Cargo
                  </th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Gestión de Pagos
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-white">
                <tr className="hover:bg-amber-50/20 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-md">
                        CR
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                          Cristhian Rodríguez
                        </div>
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                          Activo
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">
                      Cédula
                    </div>
                    <div className="text-sm text-gray-700 font-mono font-bold">0940501596</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                      Trabajador
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-3">
                      <button className="flex items-center gap-2 bg-amber-400/10 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-amber-950 transition-all border border-amber-200/50">
                        <MdPayments size={16} />
                        Pagar Jornal
                      </button>
                      <button className="flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-100">
                        <FaHistory size={14} />
                        Historial
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(true)}
                        className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                      >
                        <FaUserEdit size={18} />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DE EMPLEADOS --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
      >
        <form className="space-y-5">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre del Trabajador
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all shadow-sm">
              <MdPerson className="text-amber-500 mr-3" size={20} />
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cédula */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Cédula
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdBadge className="text-amber-500 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="09XXXXXXXX"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Teléfono
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdPhone className="text-amber-500 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="0987654321"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Cargo
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <FaUserTie className="text-amber-500 mr-3" size={18} />
              <select className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer uppercase">
                <option value="trabajador">Trabajador</option>
              </select>
            </div>
          </div>

          {/* Botones de Acción */}
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
              {isEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Nomina
