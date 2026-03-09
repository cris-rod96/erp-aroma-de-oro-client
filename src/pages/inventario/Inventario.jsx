import { useState } from 'react'
import { Container, Modal } from '../../components/index.components'
import { FaUserEdit, FaPlus, FaBoxOpen } from 'react-icons/fa'
import { MdDelete, MdInventory, MdScale, MdNumbers, MdDescription } from 'react-icons/md'

const Inventario = () => {
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
              Gestión de Inventario
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Control de existencias y unidades de medida
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <FaPlus size={14} />
            Nuevo Producto
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* --- VISTA DESKTOP --- */}
          <div className="hidden md:block overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Unidad Medida
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Stock Actual
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mr-3 shadow-md group-hover:scale-105 transition-transform">
                        <MdInventory size={20} />
                      </div>
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                        Cacao Seco
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 uppercase font-black tracking-widest">
                    Quintal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-black text-gray-900 bg-amber-100 px-4 py-1 rounded-full border border-amber-200">
                      120.00
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(true)}
                        className="text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <FaUserEdit size={20} />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL --- */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="p-5 flex flex-col gap-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black shadow-xl border border-amber-400/20">
                    <MdInventory size={28} />
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-black text-gray-900 uppercase tracking-tighter leading-tight">
                      Cacao Seco
                    </div>
                    <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-1">
                      Producto Principal
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  En Stock
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 bg-gray-50/50 px-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Unidad Medida
                  </span>
                  <span className="text-xs text-gray-800 font-black uppercase tracking-tighter">
                    Quintal
                  </span>
                </div>
                <div className="flex flex-col border-l border-gray-200 pl-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Stock Disp.
                  </span>
                  <span className="text-sm font-mono text-gray-900 font-black">120.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center text-[9px] font-black text-gray-400 tracking-widest uppercase">
                  Control de bodega
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleOpenModal(true)}
                    className="text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    <FaUserEdit size={22} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 cursor-pointer">
                    <MdDelete size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE INVENTARIO --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form className="space-y-5">
          {/* Nombre del Producto */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre del Producto
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all shadow-sm">
              <FaBoxOpen className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                placeholder="Ej. Cacao Seco"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unidad de Medida */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Unidad de Medida
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdScale className="text-amber-500 mr-3" size={20} />
                <select className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer uppercase">
                  <option value="quintal">Quintal</option>
                  <option value="kilo">Kilogramo</option>
                  <option value="libra">Libra</option>
                  <option value="unidad">Unidad</option>
                </select>
              </div>
            </div>
            {/* Stock Inicial */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Stock Inicial
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdNumbers className="text-amber-500 mr-3" size={20} />
                <input
                  type="number"
                  placeholder="0.00"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Descripción Corta
            </label>
            <div className="flex items-start py-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdDescription className="text-amber-500 mr-3 mt-1" size={18} />
              <textarea
                placeholder="Detalles adicionales del producto..."
                rows="3"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95 italic"
            >
              {isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Inventario
