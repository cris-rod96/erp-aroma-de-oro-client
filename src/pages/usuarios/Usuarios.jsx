import { useState } from 'react'
import { FaUserEdit, FaUserPlus } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import { MdBadge, MdDelete, MdEmail, MdLock, MdPerson, MdPhone } from 'react-icons/md'

const Usuarios = () => {
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
              Gestión de Usuarios
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Control de acceso y roles del sistema
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <FaUserPlus size={16} />
            Nuevo Usuario
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Vista para escritorio */}
          <div className="hidden md:block overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Nombres
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Cédula
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Correo
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-900 text-amber-400 flex items-center justify-center font-black text-xs">
                        C
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-bold text-gray-900 uppercase tracking-tighter">
                          Cristhian Rodríguez
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    0940501596
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    crisrodam1996@gmail.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    0967148226
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-tighter">
                      Administrador
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center text-[10px] font-black text-red-600 tracking-widest">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                      INACTIVO
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(true)}
                      className="text-gray-400 hover:text-gray-900 mr-4 cursor-pointer transition-colors"
                    >
                      <FaUserEdit size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors">
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vista para móviles */}
          <div className="md:hidden divide-y divide-gray-200">
            <div className="p-5 flex flex-col gap-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black shadow-md border border-amber-400/20">
                    C
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-black text-gray-900 uppercase tracking-tighter">
                      Cristhian Rodríguez
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      crisrodam1996@gmail.com
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                  Admin
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 bg-gray-50/50 px-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Cédula
                  </span>
                  <span className="text-xs font-mono text-gray-800 font-bold tracking-tighter">
                    0940501596
                  </span>
                </div>
                <div className="flex flex-col border-l border-gray-200 pl-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Teléfono
                  </span>
                  <span className="text-xs text-gray-800 font-bold tracking-tighter">
                    0967148226
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center text-[10px] font-black text-red-600 tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                  INACTIVO
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleOpenModal(true)}
                    className="text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    <FaUserEdit size={22} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors">
                    <MdDelete size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombres Completos
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdPerson className="text-amber-500 mr-3" size={20} />
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Correo Electrónico
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdEmail className="text-amber-500 mr-3" size={20} />
              <input
                type="email"
                placeholder="usuario@aroma.com"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Rol de Sistema
            </label>
            <select className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 focus:border-amber-400 outline-none px-4 text-sm font-bold text-gray-700 appearance-none cursor-pointer">
              <option value="user">Usuario Estándar</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Contraseña Temporal
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdLock className="text-amber-500 mr-3" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
          )}

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
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95 italic"
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Usuarios
