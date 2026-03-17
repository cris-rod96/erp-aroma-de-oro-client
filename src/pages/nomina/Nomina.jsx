import { useState, useEffect } from 'react'
import { FaUserEdit, FaPlus, FaIdCard, FaUserTie, FaHistory, FaUsers } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import {
  MdDelete,
  MdPhone,
  MdLocationOn,
  MdInbox,
  MdListAlt,
  MdPayments,
  MdAttachMoney,
  MdEventNote,
  MdReceiptLong,
  MdPerson,
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { trabajadorAPI, nominaAPI } from '../../api/index.api'
import Swal from 'sweetalert2'

const Nomina = () => {
  // Tabs: 'empleados' | 'historial'
  const [activeTab, setActiveTab] = useState('empleados')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTrabajador, setSelectedTrabajador] = useState(null)
  const [trabajadores, setTrabajadores] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // ESTADOS INICIALES
  const initialFormState = {
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    tipo: 'Trabajador',
    estaActivo: true,
  }

  const initialPagoState = {
    dias: 1,
    valorJornal: 15,
    bono: 0,
    descuento: 0,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [pagoData, setPagoData] = useState(initialPagoState)

  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.adminData)
  const caja = useCajaStore((state) => state.caja)
  const setCaja = useCajaStore((state) => state.setCaja)

  const totalPagar =
    pagoData.dias * pagoData.valorJornal +
    parseFloat(pagoData.bono || 0) -
    parseFloat(pagoData.descuento || 0)

  const resetFormularios = () => {
    setFormData(initialFormState)
    setPagoData(initialPagoState)
    setSelectedTrabajador(null)
    setSelectedId(null)
    setIsEdit(false)
  }

  const fetchTrabajadores = async () => {
    setFetching(true)
    try {
      const resp = await trabajadorAPI.listarTodos(token)
      const data = resp.data.trabajadores || resp.data || []
      setTrabajadores(data.filter((t) => t.tipo === 'Trabajador'))
    } catch (error) {
      console.log('Error al listar nómina', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchPagos = async () => {
    setFetching(true)
    try {
      const resp = await nominaAPI.listarPagos(token)
      setPagos(resp.data.pagos || [])
    } catch (error) {
      console.log('Error al listar historial', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'empleados') fetchTrabajadores()
    if (activeTab === 'historial') fetchPagos()
  }, [activeTab])

  // Lógica CRUD Empleados
  const handleOpenModal = (edit = false, trabajador = null) => {
    if (edit && trabajador) {
      setIsEdit(true)
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
      resetFormularios()
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await trabajadorAPI.actualizarTrabajador(selectedId, formData, token)
        Swal.fire('Éxito', 'Datos actualizados', 'success')
      } else {
        await trabajadorAPI.agregarTrabajador(formData, token)
        Swal.fire('Éxito', 'Empleado registrado', 'success')
      }
      setIsModalOpen(false)
      resetFormularios()
      fetchTrabajadores()
    } catch (error) {
      setIsModalOpen(false)
      Swal.fire('Error', error.response?.data?.message || 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar empleado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, eliminar',
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

  // Lógica de Pagos
  const handleOpenPago = (trabajador) => {
    if (!caja || caja.estado !== 'Abierta') {
      return Swal.fire('Caja Cerrada', 'Debe abrir caja para realizar pagos', 'warning')
    }
    resetFormularios()
    setSelectedTrabajador(trabajador)
    setIsPagoModalOpen(true)
  }

  const handleConfirmarPago = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        PersonaId: selectedTrabajador.id,
        diasTrabajados: pagoData.dias,
        valorJornal: pagoData.valorJornal,
        bono: pagoData.bono,
        descuento: pagoData.descuento,
        CajaId: caja.id,
        UsuarioId: user.id,
      }

      const resp = await nominaAPI.pagarJornal(payload, token)
      if (resp.status === 200) {
        setCaja(resp.data.caja)
        setIsPagoModalOpen(false)
        Swal.fire('¡Pago Exitoso!', resp.data.message, 'success')
        resetFormularios()
        fetchTrabajadores()
      }
    } catch (error) {
      setIsPagoModalOpen(false)
      Swal.fire('Error', error.response?.data?.message || 'Error', 'error')
    } finally {
      setLoading(false)
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
          {activeTab === 'empleados' && (
            <button
              onClick={() => handleOpenModal(false)}
              className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 justify-center"
            >
              <FaPlus size={14} /> Nuevo Empleado
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-8 mb-8 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('empleados')}
            className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'empleados' ? 'border-b-2 border-amber-500 text-gray-900' : 'text-gray-400'}`}
          >
            <FaUsers size={16} /> Lista de Personal
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historial' ? 'border-b-2 border-amber-500 text-gray-900' : 'text-gray-400'}`}
          >
            <FaHistory size={14} /> Historial de Pagos
          </button>
        </div>

        {/* TABLA CONTENEDOR */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
              Sincronizando información...
            </div>
          ) : activeTab === 'empleados' ? (
            /* TABLA EMPLEADOS */
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
                  {trabajadores.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                          No hay empleados registrados
                        </p>
                      </td>
                    </tr>
                  ) : (
                    trabajadores.map((t) => (
                      <tr key={t.id} className="hover:bg-amber-50/20 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm ${t.estaActivo ? 'bg-gray-900 text-amber-400' : 'bg-gray-200 text-gray-400'}`}
                            >
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
                          <button
                            onClick={() => handleOpenPago(t)}
                            disabled={!t.estaActivo}
                            className="flex items-center mx-auto gap-2 bg-amber-400/10 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-amber-950 transition-all border border-amber-200/50 disabled:opacity-30"
                          >
                            <MdPayments size={16} /> Pagar Jornal
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <button
                              onClick={() => handleOpenModal(true, t)}
                              className="p-2.5 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                              <FaUserEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2.5 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <MdDelete size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* TABLA HISTORIAL PAGOS (CORREGIDA) */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Fecha
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Beneficiario
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Cajero
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Días
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Jornal
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Bono
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Desc.
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {pagos.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-20 text-center">
                        <MdReceiptLong size={60} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                          No se han registrado pagos todavía
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pagos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-gray-500 font-bold uppercase italic">
                          {new Date(p.fechaPago || p.createdAt).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                            {p.Persona?.nombreCompleto || 'S/N'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MdPerson className="text-amber-500" size={14} />
                            <div className="text-[11px] text-gray-600 uppercase font-bold leading-none">
                              {p.Usuario?.nombresCompletos || 'S/N'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-[13px] text-gray-800 font-black">
                            {p.diasTrabajados || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-[13px] text-gray-800 font-bold">
                          ${parseFloat(p.valorJornal).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-[13px] text-emerald-600 font-bold">
                          ${parseFloat(p.bono || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-[13px] text-red-500 font-bold">
                          ${parseFloat(p.descuento || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-mono font-black text-sm border border-emerald-100/50">
                            ${parseFloat(p.totalPago || p.total).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PAGO JORNAL */}
      <Modal
        isOpen={isPagoModalOpen}
        onClose={() => {
          setIsPagoModalOpen(false)
          resetFormularios()
        }}
        title={`Jornal: ${selectedTrabajador?.nombreCompleto || '...'}`}
      >
        <form onSubmit={handleConfirmarPago} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Días Trabajados
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 focus-within:border-amber-400 transition-all">
                <MdEventNote className="text-amber-500 mr-2" size={18} />
                <input
                  type="number"
                  min="1"
                  className="bg-transparent w-full outline-none font-black text-sm text-gray-700"
                  value={pagoData.dias}
                  onChange={(e) => setPagoData({ ...pagoData, dias: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Valor Jornal ($)
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 focus-within:border-amber-400 transition-all">
                <MdAttachMoney className="text-emerald-500 mr-2" size={20} />
                <input
                  type="number"
                  step="0.01"
                  className="bg-transparent w-full outline-none font-black text-sm text-gray-700"
                  value={pagoData.valorJornal}
                  onChange={(e) => setPagoData({ ...pagoData, valorJornal: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Extras</label>
              <input
                type="number"
                step="0.01"
                className="h-14 bg-emerald-50/30 rounded-2xl border border-emerald-100 px-4 outline-none font-bold text-sm text-emerald-600"
                value={pagoData.bono}
                onChange={(e) => setPagoData({ ...pagoData, bono: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Descuentos
              </label>
              <input
                type="number"
                step="0.01"
                className="h-14 bg-red-50/30 rounded-2xl border border-red-100 px-4 outline-none font-bold text-sm text-red-600"
                value={pagoData.descuento}
                onChange={(e) => setPagoData({ ...pagoData, descuento: e.target.value })}
              />
            </div>
          </div>
          <div className="bg-gray-900 rounded-[2rem] p-8 flex justify-between items-center shadow-2xl relative overflow-hidden mt-4">
            <div>
              <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] mb-1">
                Total Neto
              </p>
              <p className="text-4xl font-black text-white font-mono italic">
                ${totalPagar.toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all z-10 italic"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL EMPLEADO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetFormularios()
        }}
        title={isEdit ? 'Actualizar Empleado' : 'Nuevo Registro'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Nombre Completo
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
              <FaUserTie className="text-amber-500 mr-3" size={18} />
              <input
                type="text"
                required
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="NOMBRE DEL TRABAJADOR"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Tipo Doc.
              </label>
              <select
                value={formData.tipoIdentificacion}
                onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
                className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 w-full text-sm font-bold text-gray-700 outline-none"
              >
                <option value="Cédula">Cédula</option>
                <option value="RUC">RUC</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Número Doc.
              </label>
              <input
                type="text"
                required
                value={formData.numeroIdentificacion}
                onChange={(e) => setFormData({ ...formData, numeroIdentificacion: e.target.value })}
                className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 w-full text-sm font-bold text-gray-700 font-mono outline-none"
                placeholder="DIGITOS"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Teléfono
              </label>
              <input
                type="text"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 w-full text-sm font-bold text-gray-700 outline-none"
                placeholder="09XXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value.toUpperCase() })
                }
                className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 w-full text-sm font-bold text-gray-700 uppercase outline-none"
                placeholder="CIUDAD/SECTOR"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetFormularios()
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] italic"
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
