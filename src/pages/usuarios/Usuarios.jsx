import { useState, useEffect } from 'react'
import { FaUserEdit, FaUserPlus, FaTrash } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import {
  MdBadge,
  MdDelete,
  MdEmail,
  MdLock,
  MdPerson,
  MdPhone,
  MdInbox,
  MdSecurity,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { usuarioAPI } from '../../api/index.api'

const Usuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    nombresCompletos: '',
    cedula: '',
    telefono: '',
    correo: '',
    clave: '',
    esAdministrador: false,
    estaActivo: true,
  })

  const token = useAuthStore((state) => state.token)

  const fetchUsuarios = async () => {
    setFetching(true)
    try {
      const resp = await usuarioAPI.listarUsuarios(token)
      // Ajusta según cómo responda tu backend (resp.data o resp.data.usuarios)
      setUsuarios(resp.data.usuarios || resp.data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleOpenModal = (edit = false, usuario = null) => {
    setIsEdit(edit)
    if (edit && usuario) {
      setSelectedId(usuario.id)
      setFormData({
        nombresCompletos: usuario.nombresCompletos,
        cedula: usuario.cedula,
        telefono: usuario.telefono,
        correo: usuario.correo,
        clave: '', // La clave no se suele enviar de vuelta al editar
        esAdministrador: usuario.esAdministrador,
        estaActivo: usuario.estaActivo,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombresCompletos: '',
        cedula: '',
        telefono: '',
        correo: '',
        clave: '',
        esAdministrador: false,
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        // En actualización, si la clave está vacía, podrías eliminarla del objeto antes de enviar
        const dataToUpdate = { ...formData }
        if (!dataToUpdate.clave) delete dataToUpdate.clave

        await usuarioAPI.actualizarUsuario(selectedId, dataToUpdate, token)
        Swal.fire('Actualizado', 'Usuario modificado correctamente', 'success')
      } else {
        await usuarioAPI.agregarUsuario(formData, token)
        Swal.fire('Creado', 'Nuevo usuario registrado', 'success')
      }
      fetchUsuarios()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error en la operación', 'error')
    } finally {
      setIsModalOpen(false)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (confirm.isConfirmed) {
      try {
        await usuarioAPI.eliminarUsuario(id, token)
        fetchUsuarios()
        Swal.fire('Eliminado', 'Usuario borrado del sistema', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar al usuario', 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-gray-800">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Control de acceso Aroma de Oro
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(false)}
            className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center"
          >
            <FaUserPlus size={16} /> Nuevo Usuario
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando seguridad...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                No hay usuarios registrados
              </p>
            </div>
          ) : (
            <>
              {/* VISTA ESCRITORIO */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Usuario
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Teléfono
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Rol
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Estado
                      </th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-amber-50/20 transition-colors group">
                        {/* USUARIO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                              {u.nombresCompletos.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                                {u.nombresCompletos}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono mt-1">
                                {u.cedula}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600 font-medium">
                            <MdEmail className="mr-2 text-amber-500/50" />
                            {u.correo}
                          </div>
                        </td>

                        {/* TELÉFONO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600 font-bold tracking-tight">
                            <MdPhone className="mr-2 text-amber-500/50" />
                            {u.telefono}
                          </div>
                        </td>

                        {/* ROL */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              u.esAdministrador
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}
                          >
                            {u.esAdministrador ? 'Administrador' : 'Estándar'}
                          </span>
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`flex items-center text-[9px] font-black tracking-[0.15em] ${u.estaActivo ? 'text-green-600' : 'text-red-500'}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full mr-2 ${u.estaActivo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}
                              ></span>
                              {u.estaActivo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                          </div>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(true, u)}
                              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
                            >
                              <FaUserEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            >
                              <MdDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* VISTA MÓVIL */}
              <div className="md:hidden divide-y divide-gray-50">
                {usuarios.map((u) => (
                  <div key={u.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black uppercase">
                          {u.nombresCompletos.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                            {u.nombresCompletos}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                            {u.esAdministrador ? 'Admin' : 'Estándar'}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${u.estaActivo ? 'bg-green-500' : 'bg-red-500'}`}
                      ></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(true, u)}
                        className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombres Completos
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4 transition-all">
              <MdPerson className="text-amber-500 mr-3" size={20} />
              <input
                type="text"
                required
                value={formData.nombresCompletos}
                onChange={(e) =>
                  setFormData({ ...formData, nombresCompletos: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                placeholder="NOMBRE COMPLETO"
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
                  required
                  maxLength={10}
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 font-mono"
                  placeholder="09XXXXXXXX"
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
                  required
                  maxLength={10}
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                  placeholder="09XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Correo Electrónico
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <MdEmail className="text-amber-500 mr-3" size={20} />
              <input
                type="email"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                placeholder="usuario@aroma.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Rol de Sistema
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 px-4">
                <MdSecurity className="text-amber-500 mr-3" size={20} />
                <select
                  value={formData.esAdministrador}
                  onChange={(e) =>
                    setFormData({ ...formData, esAdministrador: e.target.value === 'true' })
                  }
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="false">Usuario Estándar</option>
                  <option value="true">Administrador</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Estado
              </label>
              <select
                value={formData.estaActivo}
                onChange={(e) =>
                  setFormData({ ...formData, estaActivo: e.target.value === 'true' })
                }
                className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 outline-none"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Solo mostramos clave si es nuevo o si el usuario quiere cambiarla al editar */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              {isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <MdLock className="text-amber-500 mr-3" size={20} />
              <input
                type="password"
                required={!isEdit}
                value={formData.clave}
                onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl transition-all active:scale-95 italic"
            >
              {loading ? 'Procesando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Usuarios
