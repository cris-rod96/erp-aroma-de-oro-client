import { useState, useEffect } from 'react'
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
import { Container, Modal } from '../../components/index.components'
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

const Productores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [productores, setProductores] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    email: '',
    tipo: 'Productor',
    estaActivo: true, // Nuevo campo
  })

  const token = useAuthStore((state) => state.token)

  const fetchProductores = async () => {
    setFetching(true)
    try {
      const resp = await productorAPI.listarTodos(token)
      setProductores(resp.data.productores || [])
    } catch (error) {
      console.log('Error al listar productores', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchProductores()
  }, [])

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-gray-800">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              Gestión de Productores
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Directorio Aroma de Oro
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(false)}
            className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center"
          >
            <FaPlus size={14} /> Nuevo Productor
          </button>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando proveedores...
            </div>
          ) : productores.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                No hay productores
              </p>
            </div>
          ) : (
            <>
              {/* --- VISTA ESCRITORIO --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Productor
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Identificación
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
                    {productores.map((productor) => (
                      <tr
                        key={productor.id}
                        className="hover:bg-amber-50/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-11 w-11 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase">
                              {productor.nombreCompleto.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                                {productor.nombreCompleto}
                              </div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center mt-1">
                                <MdLocationOn className="mr-1 text-amber-500" />{' '}
                                {productor.direccion || 'S/N'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">
                            {productor.tipoIdentificacion}
                          </div>
                          <div className="text-sm text-gray-700 font-mono font-bold">
                            {productor.numeroIdentificacion}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {productor.estaActivo ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>{' '}
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleVerLiquidaciones(productor.id)}
                              title="Ver Liquidaciones"
                              className="p-2.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <MdReceiptLong size={20} />
                            </button>
                            <button
                              onClick={() => handleOpenModal(true, productor)}
                              title="Editar"
                              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                              <FaUserEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(productor.id)}
                              title="Eliminar"
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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

              {/* --- VISTA MÓVIL --- */}
              <div className="md:hidden divide-y divide-gray-50">
                {productores.map((productor) => (
                  <div key={productor.id} className="p-6 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black uppercase text-base shadow-md">
                          {productor.nombreCompleto.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-tight">
                            {productor.nombreCompleto}
                          </div>
                          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                            {productor.numeroIdentificacion}
                          </div>
                        </div>
                      </div>
                      {productor.estaActivo ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-300" />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerLiquidaciones(productor.id)}
                        className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Ventas
                      </button>
                      <button
                        onClick={() => handleOpenModal(true, productor)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(productor.id)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
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
