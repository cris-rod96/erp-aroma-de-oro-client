import { useState, useEffect } from 'react'
import {
  FaPlus,
  FaHistory,
  FaUsers,
  FaHandHoldingUsd,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPlusCircle,
  FaArrowDown,
} from 'react-icons/fa'
import { Container, Modal, NominaHeader, NominaTable } from '../../components/index.components'
import { MdDelete, MdPayments } from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import Swal from 'sweetalert2'
import prestamoAPI from '../../api/prestamo/prestamo.api'
import { nominaAPI, trabajadorAPI } from '../../api/index.api'
import { exportarNominaPDF } from '../../utils/nominaReport'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { useMemo } from 'react'

const Nomina = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('empleados')
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTrabajador, setSelectedTrabajador] = useState(null)
  const [trabajadores, setTrabajadores] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [prestamoActivo, setPrestamoActivo] = useState(null)
  const [cumplesHoy, setCumplesHoy] = useState([])
  const [cumplesManana, setCumplesManana] = useState([])

  const initialFormState = {
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
    tipo: 'Trabajador',
    estaActivo: true,
    fechaNacimiento: '',
  }

  const initialPagoState = {
    tipoPeriodo: 'Jornal',
    unidadesTrabajadas: 1,
    sueldoBase: 15,
    bono: 0,
    descuentoGeneral: 0,
    descuentoPrestamo: 0,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [pagoData, setPagoData] = useState(initialPagoState)
  const [searchTerm, setSearchTerm] = useState('')
  const [verEliminados, setVerEliminados] = useState(false)

  // --- STORES ---
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const caja = useCajaStore((state) => state.caja)
  const setCaja = useCajaStore((state) => state.setCaja)
  const empresa = useEmpresaStore((store) => store.empresa)

  const empleadosFiltrados = useMemo(() => {
    let lista = trabajadores.filter((t) => t.estaActivo === !verEliminados)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return lista.filter(
        (l) =>
          l.numeroIdentificacion.toLowerCase().includes(search) ||
          l.nombreCompleto.toLowerCase().includes(search)
      )
    }
    return lista
  }, [trabajadores, searchTerm, verEliminados])

  // --- LÓGICA DE CÁLCULOS ---
  const subTotal =
    pagoData.tipoPeriodo === 'Jornal'
      ? parseFloat(pagoData.unidadesTrabajadas || 0) * parseFloat(pagoData.sueldoBase || 0)
      : parseFloat(pagoData.sueldoBase || 0)

  const totalPagar =
    subTotal +
    parseFloat(pagoData.bono || 0) -
    parseFloat(pagoData.descuentoGeneral || 0) -
    parseFloat(pagoData.descuentoPrestamo || 0)

  // --- EFECTOS ---
  useEffect(() => {
    if (activeTab === 'empleados') fetchTrabajadores()
    else fetchPagos()
  }, [activeTab])

  useEffect(() => {
    if (isPagoModalOpen) {
      const hoy = new Date()
      const diasMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
      if (pagoData.tipoPeriodo === 'Semanal') setPagoData((p) => ({ ...p, unidadesTrabajadas: 7 }))
      else if (pagoData.tipoPeriodo === 'Quincenal')
        setPagoData((p) => ({ ...p, unidadesTrabajadas: 15 }))
      else if (pagoData.tipoPeriodo === 'Mensual')
        setPagoData((p) => ({ ...p, unidadesTrabajadas: diasMesActual }))
    }
  }, [pagoData.tipoPeriodo, isPagoModalOpen])

  // --- MÉTODOS DE CARGA ---
  const fetchTrabajadores = async () => {
    setFetching(true)
    setError(null)
    try {
      const [respTrabajadores, respCumples] = await Promise.all([
        trabajadorAPI.listarTodos(token),
        trabajadorAPI.listarProximosCumples(token),
      ])
      setTrabajadores(respTrabajadores.data?.trabajadores || [])
      setCumplesHoy(respCumples.data?.cumples?.alertasHoy || [])
      setCumplesManana(respCumples.data?.cumples?.alertasManana || [])
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cargar nómina'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  const fetchPagos = async () => {
    setFetching(true)
    setError(null)
    try {
      const resp = await nominaAPI.listarPagos(token)
      setPagos(resp.data.pagos || [])
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cargar nómina'
      setError(msg)
    } finally {
      setFetching(false)
    }
  }

  // --- HANDLERS TRABAJADOR (MÉTODOS APARTE) ---
  const handleAbrirNuevo = () => {
    setFormData(initialFormState)
    setIsEdit(false)
    setIsModalOpen(true)
  }

  const handleEditTrabajador = (t) => {
    setSelectedId(t.id)
    setFormData({
      nombreCompleto: t.nombreCompleto,
      tipoIdentificacion: t.tipoIdentificacion,
      numeroIdentificacion: t.numeroIdentificacion,
      telefono: t.telefono || '',
      direccion: t.direccion || '',
      tipo: t.tipo,
      estaActivo: t.estaActivo,
      fechaNacimiento: t.fechaNacimiento || '',
    })
    setIsEdit(true)
    setIsModalOpen(true)
  }

  const handleSaveTrabajador = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await trabajadorAPI.actualizarTrabajador(selectedId, formData, token)
        Swal.fire('¡Éxito!', 'Personal actualizado', 'success')
      } else {
        console.log(formData)
        await trabajadorAPI.agregarTrabajador(formData, token)
        Swal.fire('¡Éxito!', 'Nuevo trabajador registrado', 'success')
      }
      setIsModalOpen(false)
      fetchTrabajadores()
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al guardar'
      Swal.fire('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrabajador = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar trabajador?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    })
    if (result.isConfirmed) {
      try {
        await trabajadorAPI.eliminarTrabajador(id, token)
        Swal.fire('Eliminado', 'Trabajador eliminado', 'success')
        fetchTrabajadores()
      } catch (error) {
        const msg = error.response?.data.message || 'Error al eliminar'
        Swal.fire('Error', msg, 'error')
      }
    }
  }

  // --- HANDLERS PAGOS ---
  const handleOpenPago = async (trabajador) => {
    if (!caja || caja.estado !== 'Abierta')
      return Swal.fire('Caja Cerrada', 'Debes abrir caja para procesar pagos', 'warning')

    setPagoData(initialPagoState)
    setSelectedTrabajador(trabajador)
    try {
      const res = await prestamoAPI.listarTodos(token)
      const deuda = (res.data.prestamos || []).find(
        (p) => p.PersonaId === trabajador.id && p.estado === 'Pendiente'
      )
      if (deuda) {
        setPrestamoActivo(deuda)
        setPagoData((prev) => ({ ...prev, descuentoPrestamo: parseFloat(deuda.montoCuota) }))
      } else setPrestamoActivo(null)
    } catch (e) {
      console.error(e)
    }
    setIsPagoModalOpen(true)
  }

  const handleConfirmarPago = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        PersonaId: selectedTrabajador.id,
        UsuarioId: user.id,
        CajaId: caja.id,
        PrestamoId: prestamoActivo?.id || null,
        ...pagoData,
        subTotal,
        totalPagar,
      }
      const resp = await nominaAPI.pagarJornal(payload, token)
      if (resp.status === 200 || resp.status === 201) {
        if (resp.data.caja) setCaja(resp.data.caja)
        setIsPagoModalOpen(false)
        Swal.fire({
          title: '¡Pago Éxitoso!',
          icon: 'success',
        })
        fetchTrabajadores()
      }
    } catch (e) {
      Swal.fire('Error', e.response?.data.message || 'No se pudo procesar el pago', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImprimir = (pago) => exportarNominaPDF(pago, empresa)
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
  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: '¿Restaurar trabajador?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Emerald 500
      confirmButtonText: 'Sí, restaurar',
    })

    if (confirm.isConfirmed) {
      try {
        await trabajadorAPI.recuperarTrabajador(id, token)
        fetchTrabajadores()
        Swal.fire('Recuperación', 'Trabajador recuperado con éxito', 'success')
        setVerEliminados(false)
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al recuperar trabajador'
        Swal.fire('Error', msg, 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        <NominaHeader
          activeTab={activeTab}
          handleOpenModal={handleAbrirNuevo} // Llama al método de limpieza
          setActiveTab={setActiveTab}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verEliminados={verEliminados}
          setVerEliminados={setVerEliminados}
        />

        <NominaTable
          activeTab={activeTab}
          data={activeTab === 'empleados' ? empleadosFiltrados : pagos}
          fetching={fetching}
          handleDelete={handleDeleteTrabajador}
          handleEdit={handleEditTrabajador}
          handleImprimir={handleImprimir}
          handleOpenPago={handleOpenPago}
          handleRestore={handleRestore}
          error={error}
          cumplesHoy={cumplesHoy}
          cumplesManana={cumplesManana}
        />
      </div>

      {/* MODAL PAGO */}
      <Modal
        show={isPagoModalOpen}
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        title={`Liquidación: ${selectedTrabajador?.nombreCompleto}`}
      >
        <form onSubmit={handleConfirmarPago} className="space-y-6">
          {/* SECCIÓN 1: INFO PRÉSTAMO - COMPACTA */}
          {prestamoActivo && (
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shrink-0">
                  <FaHandHoldingUsd size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">
                    Deuda Activa
                  </p>
                  <p className="text-xl font-black text-gray-950 font-mono tracking-tighter leading-none">
                    ${parseFloat(prestamoActivo.saldoPendiente).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right border-l border-gray-100 pl-4 py-1">
                <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">
                  Cuota Sugerida
                </p>
                <p className="text-sm font-black text-emerald-700 tracking-tight leading-none">
                  ${parseFloat(prestamoActivo.montoCuota).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: INGRESOS - LIMPIA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <FaMoneyBillWave className="text-gray-400" size={14} />
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Sueldo Base ($)
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-black font-mono outline-none focus:border-emerald-400 transition-all shadow-inner"
                value={pagoData.sueldoBase}
                onChange={(e) => setPagoData({ ...pagoData, sueldoBase: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <FaPlusCircle className="text-emerald-400" size={14} />
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Bono (+)
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                className="w-full h-12 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 text-xs font-black font-mono outline-none focus:border-emerald-400 shadow-inner"
                value={pagoData.bono}
                onChange={(e) => setPagoData({ ...pagoData, bono: e.target.value })}
              />
            </div>
          </div>

          {/* SECCIÓN 3: DESCUENTO - DETALLADA PERO SOBRIA */}
          <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <FaArrowDown className="text-red-400" size={14} />
                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                  Descuento Préstamo (-)
                </h3>
              </div>
              {pagoData.descuentoPrestamo > Number(pagoData.sueldoBase) + Number(pagoData.bono) && (
                <span className="text-[9px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">
                  ¡Excede el sueldo!
                </span>
              )}
            </div>

            <input
              type="number"
              step="0.01"
              disabled={!prestamoActivo}
              className={`w-full h-12 rounded-xl px-4 text-xs font-black font-mono outline-none transition-all shadow-inner ${
                prestamoActivo
                  ? 'bg-white border border-gray-200 focus:border-red-400'
                  : 'bg-gray-100/50 cursor-not-allowed border-dashed'
              }`}
              value={pagoData.descuentoPrestamo}
              onChange={(e) => setPagoData({ ...pagoData, descuentoPrestamo: e.target.value })}
            />
          </div>

          {/* SECCIÓN 4: TOTAL Y BOTÓN - DISEÑO TIPO FEED, NO FLOAT */}
          <div className="bg-gray-900 border border-gray-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border-b-4 border-amber-600">
            <div className="w-full sm:w-auto text-center sm:text-left">
              <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">
                Neto a Recibir
              </p>
              <p className="text-4xl font-black text-white italic font-mono tracking-tighter leading-none mt-1">
                ${totalPagar.toFixed(2)}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || totalPagar <= 0}
              className="w-full sm:w-auto bg-amber-400 text-amber-950 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-300 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 italic disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                '...'
              ) : totalPagar < 0 ? (
                'ERROR DE CÁLCULO'
              ) : totalPagar === 0 ? (
                'VALORES INVÁLIDOS'
              ) : (
                <>
                  {' '}
                  <MdPayments size={18} /> Confirmar Pago{' '}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TRABAJADOR */}
      <Modal
        show={isModalOpen}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? `Editar Personal` : 'Nuevo Registro'}
      >
        <form onSubmit={handleSaveTrabajador} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
              Nombre Completo
            </label>
            <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 focus-within:border-amber-400 transition-all">
              <FaUsers className="text-amber-500 mr-3" size={16} />
              <input
                type="text"
                placeholder="EJ: JUAN PÉREZ"
                required
                className="bg-transparent w-full outline-none text-xs font-bold uppercase"
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Cédula / RUC
              </label>
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 focus-within:border-amber-400 transition-all">
                <FaIdCard className="text-amber-500 mr-3" size={16} />
                <input
                  type="text"
                  placeholder="09XXXXXXXX"
                  required
                  className="bg-transparent w-full outline-none text-xs font-black font-mono"
                  value={formData.numeroIdentificacion}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroIdentificacion: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Fecha de Nacimiento
              </label>
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 focus-within:border-amber-400 transition-all">
                <FaCalendarAlt className="text-amber-500 mr-3" size={14} />
                <input
                  type="date"
                  required
                  className="bg-transparent w-full outline-none text-xs font-bold uppercase"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Teléfono
              </label>
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 focus-within:border-amber-400 transition-all">
                <FaPhone className="text-amber-500 mr-3" size={14} />
                <input
                  type="text"
                  placeholder="09XXXXXXXX"
                  className="bg-transparent w-full outline-none text-xs font-bold"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Dirección
              </label>
              <input
                type="text"
                placeholder="CIUDAD / RECINTO"
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold uppercase outline-none focus:border-amber-400"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Tipo Doc.
              </label>
              <select
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold outline-none"
                value={formData.tipoIdentificacion}
                onChange={(e) => setFormData({ ...formData, tipoIdentificacion: e.target.value })}
              >
                <option value="Cédula">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Estado</label>
              <select
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold outline-none"
                value={formData.estaActivo}
                onChange={(e) =>
                  setFormData({ ...formData, estaActivo: e.target.value === 'true' })
                }
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black border-b-4 border-amber-600 transition-all active:scale-95 italic"
          >
            {loading ? 'PROCESANDO...' : isEdit ? 'ACTUALIZAR FICHA' : 'GUARDAR TRABAJADOR'}
          </button>
        </form>
      </Modal>
    </Container>
  )
}

export default Nomina
