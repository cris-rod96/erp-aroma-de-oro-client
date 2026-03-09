import { useState } from 'react'
import { FaUserEdit, FaMapMarkerAlt, FaPlus, FaIdCard, FaUserAlt } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import { MdDelete, MdPhone, MdLocationOn, MdEmail } from 'react-icons/md'

const Productores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const handleOpenModal = (edit = false) => {
    setIsEdit(edit)
    setIsModalOpen(true)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER DEL MÓDULO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Gestión de Productores
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Directorio de proveedores y origen del cacao
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            <FaPlus size={14} />
            Nuevo Productor
          </button>
        </div>

        {/* TABLA Y VISTA MÓVIL */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* --- VISTA ESCRITORIO --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Productor
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Identificación
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Contacto
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-white">
                <tr className="hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-11 w-11 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                        CR
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                          Cristhian Rodríguez
                        </div>
                        <div className="flex items-center text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                          <MdLocationOn className="mr-1 text-amber-500" size={14} /> Guayas, Ecuador
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">
                      Cédula / RUC
                    </div>
                    <div className="text-sm text-gray-700 font-mono font-bold tracking-tight">
                      0940501596
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700 font-bold">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-2 text-gray-500 group-hover:text-amber-600 transition-colors">
                        <MdPhone size={16} />
                      </div>
                      0967148226
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

          {/* --- VISTA MÓVIL --- */}
          <div className="md:hidden divide-y divide-gray-50">
            <div className="p-6 flex flex-col gap-5 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-xl border-2 border-amber-400/20">
                    CR
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-black text-gray-900 uppercase tracking-tighter leading-tight">
                      Cristhian Rodríguez
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                      <FaMapMarkerAlt className="mr-1 text-amber-500" /> Guayas
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-50">
                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1 tracking-widest">
                    Identificación
                  </span>
                  <span className="text-xs font-mono text-gray-800 font-bold">0940501596</span>
                </div>
                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-1 tracking-widest">
                    Teléfono
                  </span>
                  <span className="text-xs text-gray-800 font-bold">0967148226</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center text-[10px] font-black text-emerald-600 tracking-[0.2em] italic">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  ACTIVO
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(true)}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-900 bg-gray-100 px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all active:scale-95"
                  >
                    <FaUserEdit size={14} /> EDITAR
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all active:scale-95">
                    <MdDelete size={16} /> BORRAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA PRODUCTORES --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Productor' : 'Registrar Productor'}
      >
        <form className="space-y-6">
          {/* Productor Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre Completo / Razón Social
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 transition-all shadow-sm">
              <FaUserAlt className="text-amber-500 mr-3" size={16} />
              <input
                type="text"
                placeholder="Ej. Hacienda La Bendición"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cédula */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Identificación
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 shadow-sm">
                <FaIdCard className="text-amber-500 mr-3" size={18} />
                <input
                  type="text"
                  placeholder="09XXXXXXXX"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Teléfono Celular
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 shadow-sm">
                <MdPhone className="text-amber-500 mr-3" size={18} />
                <input
                  type="text"
                  placeholder="0987654321"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Zona / Dirección
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 shadow-sm transition-all">
              <MdLocationOn className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                placeholder="Sector, Ciudad, Provincia"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          {/* Opcional: Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Correo Electrónico (Opcional)
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 shadow-sm transition-all">
              <MdEmail className="text-amber-500 mr-3" size={18} />
              <input
                type="email"
                placeholder="contacto@productor.com"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-gray-200 transition-all"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95 italic"
            >
              {isEdit ? 'Actualizar Productor' : 'Guardar Productor'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Productores
