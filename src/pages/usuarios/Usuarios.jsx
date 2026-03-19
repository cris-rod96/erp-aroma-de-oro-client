import { Container, Modal, UsuariosHeader, UsuariosTable } from '../../components/index.components'
import { MdBadge, MdEmail, MdLock, MdPerson, MdPhone, MdSecurity } from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { usuarioAPI } from '../../api/index.api'
import { useUsuarios } from '../../hooks/useUsuarios'

const Usuarios = () => {
  const token = useAuthStore((state) => state.token)
  const {
    isModalOpen,
    setIsModalOpen,
    isEdit,
    selectedId,
    fetchUsuarios,
    fetching,
    formData,
    handleOpenModal,
    setFormData,
    usuarios,
    loading,
    setLoading,
  } = useUsuarios(token)

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
        console.error(error)
        Swal.fire('Error', 'No se pudo eliminar al usuario', 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <UsuariosHeader handleOpenModal={handleOpenModal} />

        {/* CONTENIDO PRINCIPAL */}
        <UsuariosTable
          fetching={fetching}
          handleDelete={handleDelete}
          handleOpenModal={handleOpenModal}
          usuarios={usuarios}
        />
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
