import { useState } from 'react'
import { Container, Modal, UsuariosHeader, UsuariosTable } from '../../components/index.components'
import {
  MdBadge,
  MdEmail,
  MdLock,
  MdPerson,
  MdPhone,
  MdSecurity,
  MdWork,
  MdToggleOn,
  MdToggleOff,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { useUsuarios } from '../../hooks/useUsuarios'
import { usuarioAPI, trabajadorAPI } from '../../api/index.api.js'

const Usuarios = () => {
  const token = useAuthStore((state) => state.token)
  const [registrarComoTrabajador, setRegistrarComoTrabajador] = useState(false)

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

  // ESTA ES LA CONFIGURACIÓN CRÍTICA PARA QUE SALGA ADELANTE
  const swalConfig = {
    target: document.getElementById('root'), // O usa document.body si 'root' no funciona
    customClass: {
      container: 'my-swal-container',
    },
    didOpen: () => {
      // Forzamos el z-index al máximo posible
      Swal.getContainer().style.zIndex = '999999'
    },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        const dataToUpdate = { ...formData }
        if (!dataToUpdate.clave) delete dataToUpdate.clave

        await usuarioAPI.actualizarUsuario(selectedId, dataToUpdate, token)
        Swal.fire({
          ...swalConfig,
          title: '¡Actualizado!',
          text: 'Usuario modificado correctamente',
          icon: 'success',
        })
      } else {
        await usuarioAPI.agregarUsuario(formData, token)

        if (registrarComoTrabajador) {
          const dataPersona = {
            nombreCompleto: formData.nombresCompletos,
            tipoIdentificacion: 'Cédula',
            numeroIdentificacion: formData.cedula,
            tipo: 'Trabajador',
            telefono: formData.telefono,
            correo: formData.correo,
            estaActivo: true,
          }
          await trabajadorAPI.agregarTrabajador(dataPersona, token)
        }

        Swal.fire({
          ...swalConfig,
          title: '¡Creado!',
          text: registrarComoTrabajador ? 'Usuario y trabajador registrados' : 'Usuario registrado',
          icon: 'success',
        })
      }

      fetchUsuarios()
      cerrarModalLimpio()
    } catch (error) {
      console.error(error)
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: error.response?.data?.message || 'Error en la operación',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const cerrarModalLimpio = () => {
    setIsModalOpen(false)
    setRegistrarComoTrabajador(false)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        <UsuariosHeader
          handleOpenModal={() => {
            setRegistrarComoTrabajador(false)
            handleOpenModal()
          }}
        />

        <UsuariosTable
          fetching={fetching}
          handleDelete={async (id) => {
            const confirm = await Swal.fire({
              ...swalConfig,
              title: '¿Eliminar usuario?',
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
                Swal.fire({ ...swalConfig, title: 'Eliminado', icon: 'success' })
              } catch (err) {
                Swal.fire({
                  ...swalConfig,
                  title: 'Error',
                  text: 'No se pudo eliminar',
                  icon: 'error',
                })
              }
            }
          }}
          handleOpenModal={handleOpenModal}
          usuarios={usuarios}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={cerrarModalLimpio}
        title={isEdit ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombres */}
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
                placeholder="EJ. JUAN PÉREZ"
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
                  required
                  maxLength={10}
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 font-mono"
                  placeholder="0912345678"
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

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Correo Institucional
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <MdEmail className="text-amber-500 mr-3" size={20} />
              <input
                type="email"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                placeholder="correo@aromadeoro.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ROL */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Rol de Acceso
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdSecurity className="text-amber-500 mr-3" size={20} />
                <select
                  value={formData.rol || 'ESTANDAR'}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="Estandar">ESTÁNDAR</option>
                  <option value="Administrador">ADMINISTRADOR</option>
                  <option value="Contador">CONTADOR</option>
                </select>
              </div>
            </div>
            {/* ESTADO */}
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
                <option value="true">ACTIVO</option>
                <option value="false">INACTIVO</option>
              </select>
            </div>
          </div>

          {/* TRABAJADOR SWITCH */}
          {!isEdit && (
            <div
              onClick={() => setRegistrarComoTrabajador(!registrarComoTrabajador)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                registrarComoTrabajador
                  ? 'border-amber-400 bg-amber-50 shadow-md'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-xl mr-3 ${registrarComoTrabajador ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                >
                  <MdWork size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-900 uppercase">¿Es Trabajador?</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                    Vincular con nómina Aroma de Oro
                  </p>
                </div>
              </div>
              {registrarComoTrabajador ? (
                <MdToggleOn size={35} className="text-amber-500" />
              ) : (
                <MdToggleOff size={35} className="text-gray-300" />
              )}
            </div>
          )}

          {/* CLAVE */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              {isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso'}
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

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={cerrarModalLimpio}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-2xl transition-all active:scale-95 italic border-b-4 border-amber-600"
            >
              {loading ? 'Procesando...' : isEdit ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Usuarios
