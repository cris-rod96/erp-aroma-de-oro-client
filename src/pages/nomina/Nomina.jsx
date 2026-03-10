import { useState, useEffect } from 'react'
import { FaUserEdit, FaPlus, FaIdCard, FaUserTie, FaPassport, FaHistory } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import {
  MdDelete,
  MdPhone,
  MdLocationOn,
  MdInbox,
  MdListAlt,
  MdPayments,
  MdBadge,
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { trabajadorAPI } from '../../api/index.api'
import Swal from 'sweetalert2'

const Nomina = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [trabajadores, setTrabajadores] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    tipo: 'Trabajador', // Diferenciador clave
    estaActivo: true,
  })

  const token = useAuthStore((state) => state.token)

  const fetchTrabajadores = async () => {
    setFetching(true)
    try {
      const resp = await trabajadorAPI.listarTodos(token)
      // Filtramos para asegurar que solo vemos trabajadores en este módulo
      const data = resp.data.trabajadores || resp.data || []
      setTrabajadores(data.filter((t) => t.tipo === 'Trabajador'))
    } catch (error) {
      console.log('Error al listar nómina', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchTrabajadores()
  }, [])

  const handleOpenModal = (edit = false, trabajador = null) => {
    setIsEdit(edit)
    if (edit && trabajador) {
      setSelectedId(trabajador.id)
      setFormData({
        nombreCompleto: trabajador.nombreCompleto || '',
        tipoIdentificacion: trabajador.tipoIdentificacion || 'Cédula',
        numeroIdentificacion: trabajador.numeroIdentificacion || '',
        telefono: trabajador.telefono || '',
        direccion: trabajador.direccion || '',
        tipo: 'Trabajador',
        estaActivo: trabajador.estaActivo ?? true,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombreCompleto: '',
        tipoIdentificacion: 'Cédula',
        numeroIdentificacion: '',
        telefono: '',
        direccion: '',
        tipo: 'Trabajador',
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const { tipoIdentificacion, numeroIdentificacion } = formData
    if (tipoIdentificacion === 'Cédula' && numeroIdentificacion.length !== 10) {
      Swal.fire('Atención', 'La cédula debe tener 10 dígitos', 'warning')
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
        await trabajadorAPI.actualizarTrabajador(selectedId, formData, token)
        Swal.fire('Éxito', 'Datos del empleado actualizados', 'success')
      } else {
        await trabajadorAPI.agregarTrabajador(formData, token)
        Swal.fire('Éxito', 'Empleado registrado en nómina', 'success')
      }
      setIsModalOpen(false)
      fetchTrabajadores()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error en la operación', 'error')
    } finally {
      setIsModalOpen(false)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: 'Esta acción desactivará al trabajador del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    })
    if (confirm.isConfirmed) {
      try {
        await trabajadorAPI.eliminarTrabajador(id, token)
        fetchTrabajadores()
        Swal.fire('Eliminado', 'Registro actualizado', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
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
              Gestión de Nómina
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Registro de Personal Aroma de Oro
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(false)}
            className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center"
          >
            <FaPlus size={14} /> Nuevo Empleado
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando nómina...
            </div>
          ) : trabajadores.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                No hay empleados registrados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Empleado
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Identificación
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Pagos
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {trabajadores.map((t) => (
                    <tr key={t.id} className="hover:bg-amber-50/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-11 w-11 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm">
                            {t.nombreCompleto.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                              {t.nombreCompleto}
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest flex items-center mt-1 ${t.estaActivo ? 'text-emerald-600' : 'text-red-400'}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${t.estaActivo ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}
                              ></span>
                              {t.estaActivo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">
                          {t.tipoIdentificacion}
                        </div>
                        <div className="text-sm text-gray-700 font-mono font-bold">
                          {t.numeroIdentificacion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button className="flex items-center gap-2 bg-amber-400/10 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-amber-950 transition-all border border-amber-200/50">
                            <MdPayments size={16} /> Pagar Jornal
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                            <FaHistory size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(true, t)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                          >
                            <FaUserEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
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
          )}
        </div>
      </div>

      {/* MODAL DE EMPLEADO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Actualizar Empleado' : 'Nuevo Registro de Personal'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Estatus Laboral
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase">
                ¿El empleado está en funciones?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.estaActivo}
                onChange={(e) => setFormData({ ...formData, estaActivo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre Completo
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 transition-all">
              <FaUserTie className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                required
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="EJ. CARLOS ARMANDO MENDOZA"
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
                  placeholder="10 DÍGITOS"
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
                  placeholder="LOCALIDAD"
                />
              </div>
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

export default Nomina
