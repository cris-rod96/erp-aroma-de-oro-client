import {
  FaUserEdit,
  FaPlus,
  FaIdCard,
  FaUserAlt,
  FaPassport,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa'
import {
  Container,
  Modal,
  ProductoresHeader,
  ProductoresTable,
} from '../../components/index.components'
import {
  MdDelete,
  MdPhone,
  MdLocationOn,
  MdEmail,
  MdInbox,
  MdListAlt,
  MdReceiptLong,
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { productorAPI } from '../../api/index.api'
import Swal from 'sweetalert2'
import { useProductores } from '../../hooks/useProductores'

const Productores = () => {
  const token = useAuthStore((state) => state.token)
  const {
    fetchProductores,
    fetching,
    formData,
    isEdit,
    isModalOpen,
    loading,
    productores,
    selectedId,
    setFormData,
    setIsEdit,
    setIsModalOpen,
    setLoading,
    error,
    setSelectedId,
  } = useProductores(token)

  const handleOpenModal = (edit = false, productor = null) => {
    setIsEdit(edit)
    if (edit && productor) {
      setSelectedId(productor.id)
      setFormData({
        nombreCompleto: productor.nombreCompleto || '',
        tipoIdentificacion: productor.tipoIdentificacion || 'Cédula',
        numeroIdentificacion: productor.numeroIdentificacion || '',
        telefono: productor.telefono || '',
        direccion: productor.direccion || '',
        email: productor.email || '',
        tipo: 'Productor',
        estaActivo: productor.estaActivo ?? true,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombreCompleto: '',
        tipoIdentificacion: 'Cédula',
        numeroIdentificacion: '',
        telefono: '',
        direccion: '',
        email: '',
        tipo: 'Productor',
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const { tipoIdentificacion, numeroIdentificacion, telefono } = formData
    if (tipoIdentificacion === 'Cédula' && numeroIdentificacion.length !== 10) {
      Swal.fire('Atención', 'La cédula debe tener 10 dígitos', 'warning')
      return false
    }
    if (tipoIdentificacion === 'RUC' && numeroIdentificacion.length !== 13) {
      Swal.fire('Atención', 'El RUC debe tener 13 dígitos', 'warning')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      if (isEdit) {
        await productorAPI.actualizarProductor(selectedId, formData, token)
        Swal.fire('Éxito', 'Productor actualizado', 'success')
      } else {
        await productorAPI.agregarProductor(formData, token)
        Swal.fire('Éxito', 'Productor registrado', 'success')
      }
      setIsModalOpen(false)
      fetchProductores()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error en la operación', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción desactivará al productor del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'No',
    })
    if (confirm.isConfirmed) {
      try {
        await productorAPI.eliminarProductor(id, token)
        fetchProductores()
        Swal.fire('Borrado', 'Registro eliminado', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  // Función para ver liquidaciones (puedes navegar a otra ruta o abrir otro modal)
  const handleVerLiquidaciones = (id) => {
    console.log('Consultando liquidaciones del productor:', id)
    // Aquí podrías usar navigate(`/liquidaciones/productor/${id}`)
    Swal.fire('Info', 'Módulo de liquidaciones en desarrollo para este productor', 'info')
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <ProductoresHeader handleOpenModal={handleOpenModal} />

        {/* CONTENEDOR PRINCIPAL */}
        <ProductoresTable
          fetching={fetching}
          handleDelete={handleDelete}
          handleOpenModal={handleOpenModal}
          handleVerLiquidaciones={handleVerLiquidaciones}
          productores={productores}
          error={error}
        />
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Actualizar Datos' : 'Registrar Nuevo Productor'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Estado de Cuenta
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase">
                ¿El productor está habilitado?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.estaActivo}
                onChange={(e) => setFormData({ ...formData, estaActivo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre Completo
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 transition-all">
              <FaUserAlt className="text-amber-500 mr-3" />
              <input
                type="text"
                required
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="RAZÓN SOCIAL / NOMBRE"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Tipo de Doc.
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 transition-all">
                <MdListAlt className="text-amber-500 mr-3" size={20} />
                <select
                  value={formData.tipoIdentificacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoIdentificacion: e.target.value,
                      numeroIdentificacion: '',
                    })
                  }
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="Cédula">Cédula</option>
                  <option value="RUC">RUC</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Número de Doc.
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 transition-all">
                {formData.tipoIdentificacion === 'Pasaporte' ? (
                  <FaPassport className="text-amber-500 mr-3" />
                ) : (
                  <FaIdCard className="text-amber-500 mr-3" />
                )}
                <input
                  type="text"
                  required
                  maxLength={formData.tipoIdentificacion === 'RUC' ? 13 : 10}
                  value={formData.numeroIdentificacion}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroIdentificacion: e.target.value })
                  }
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Teléfono
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <MdPhone className="text-amber-500 mr-3" />
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Email (Opcional)
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <MdEmail className="text-amber-500 mr-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Dirección / Sector
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
              <MdLocationOn className="text-amber-500 mr-3" />
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="EJ. NARANJAL, GUAYAS"
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
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl transition-all italic"
            >
              {loading ? 'Procesando...' : isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Productores
