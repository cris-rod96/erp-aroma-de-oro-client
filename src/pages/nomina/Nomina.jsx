import { useState, useEffect, useMemo } from 'react'
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
  FaLayerGroup,
  FaHashtag,
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
  const subTotal = useMemo(() => {
    const sueldo = parseFloat(pagoData.sueldoBase || 0)
    const unidades = parseFloat(pagoData.unidadesTrabajadas || 0)
    return pagoData.tipoPeriodo === 'Jornal' ? unidades * sueldo : sueldo
  }, [pagoData.sueldoBase, pagoData.unidadesTrabajadas, pagoData.tipoPeriodo])

  const totalPagar = useMemo(() => {
    return (
      subTotal +
      parseFloat(pagoData.bono || 0) -
      parseFloat(pagoData.descuentoGeneral || 0) -
      parseFloat(pagoData.descuentoPrestamo || 0)
    )
  }, [subTotal, pagoData.bono, pagoData.descuentoGeneral, pagoData.descuentoPrestamo])

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
      else if (pagoData.tipoPeriodo === 'Jornal')
        setPagoData((p) => ({ ...p, unidadesTrabajadas: 1 }))
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

  // --- HANDLERS ---
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
    try {
      if (isEdit) {
        await trabajadorAPI.actualizarTrabajador(selectedId, formData, token)
        Swal.fire('¡Éxito!', 'Personal actualizado', 'success')
      } else {
        await trabajadorAPI.agregarTrabajador(formData, token)
        Swal.fire('¡Éxito!', 'Nuevo trabajador registrado', 'success')
      }
      setIsModalOpen(false)
      fetchTrabajadores()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrabajador = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar trabajador?',
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
        Swal.fire('Error', error.response?.data.message || 'Error al eliminar', 'error')
      }
    }
  }

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
        Swal.fire('¡Pago Éxitoso!', '', 'success')
        fetchTrabajadores()
      }
    } catch (e) {
      Swal.fire('Error', e.response?.data.message || 'No se pudo procesar el pago', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImprimir = (pago) => exportarNominaPDF(pago, empresa)

  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Restaurar trabajador?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
    })
    if (confirm.isConfirmed) {
      try {
        await trabajadorAPI.recuperarTrabajador(id, token)
        fetchTrabajadores()
        setVerEliminados(false)
        Swal.fire('Recuperación', 'Trabajador recuperado con éxito', 'success')
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Error', 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        <NominaHeader
          activeTab={activeTab}
          handleOpenModal={handleAbrirNuevo}
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

      {/* MODAL PAGO CORREGIDO */}
      <Modal
        show={isPagoModalOpen}
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        title={`Liquidación: ${selectedTrabajador?.nombreCompleto}`}
      >
        <form onSubmit={handleConfirmarPago} className="space-y-6">
          {/* INFO PRÉSTAMO */}
          {prestamoActivo && (
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                  <FaHandHoldingUsd size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase leading-none mb-1">
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

          {/* PERIODO Y UNIDADES (LO QUE FALTABA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <FaLayerGroup className="text-gray-400" size={14} />
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Periodo
                </label>
              </div>
              <select
                className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-black outline-none focus:border-amber-400 shadow-inner"
                value={pagoData.tipoPeriodo}
                onChange={(e) => setPagoData({ ...pagoData, tipoPeriodo: e.target.value })}
              >
                <option value="Jornal">JORNAL</option>
                <option value="Semanal">SEMANAL</option>
                <option value="Quincenal">QUINCENAL</option>
                <option value="Mensual">MENSUAL</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <FaHashtag className="text-gray-400" size={14} />
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Unidades
                </label>
              </div>
              <input
                type="number"
                disabled={pagoData.tipoPeriodo !== 'Jornal'}
                className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-black font-mono outline-none focus:border-amber-400 shadow-inner disabled:opacity-50"
                value={pagoData.unidadesTrabajadas}
                onChange={(e) => setPagoData({ ...pagoData, unidadesTrabajadas: e.target.value })}
              />
            </div>
          </div>

          {/* SUELDO Y BONO */}
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
                className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-black font-mono outline-none focus:border-emerald-400 shadow-inner"
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

          {/* DESCUENTO PRÉSTAMO */}
          <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <FaArrowDown className="text-red-400" size={14} />
                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                  Descuento Préstamo (-)
                </h3>
              </div>
              {pagoData.descuentoPrestamo > subTotal + Number(pagoData.bono) && (
                <span className="text-[9px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">
                  ¡Excede el sueldo!
                </span>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              disabled={!prestamoActivo}
              className={`w-full h-12 rounded-xl px-4 text-xs font-black font-mono outline-none shadow-inner ${
                prestamoActivo
                  ? 'bg-white border border-gray-200 focus:border-red-400'
                  : 'bg-gray-100/50 border-dashed cursor-not-allowed'
              }`}
              value={pagoData.descuentoPrestamo}
              onChange={(e) => setPagoData({ ...pagoData, descuentoPrestamo: e.target.value })}
            />
          </div>

          {/* NETO Y BOTÓN */}
          <div className="bg-gray-900 border border-gray-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border-b-4 border-amber-600">
            <div>
              <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">
                Neto a Recibir
              </p>
              <p className="text-4xl font-black text-white italic font-mono tracking-tighter mt-1">
                ${totalPagar.toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || totalPagar <= 0}
              className="bg-amber-400 text-amber-950 px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-300 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 italic disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? (
                '...'
              ) : totalPagar <= 0 ? (
                'VALORES INVÁLIDOS'
              ) : (
                <>
                  <MdPayments size={18} /> Confirmar Pago
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
                Identificación
              </label>
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4">
                <FaIdCard className="text-amber-500 mr-3" size={16} />
                <input
                  type="text"
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
                F. Nacimiento
              </label>
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4">
                <FaCalendarAlt className="text-amber-500 mr-3" size={14} />
                <input
                  type="date"
                  required
                  className="bg-transparent w-full outline-none text-xs font-bold"
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
              <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-xl px-4">
                <FaPhone className="text-amber-500 mr-3" size={14} />
                <input
                  type="text"
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
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold uppercase outline-none"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest border-b-4 border-amber-600 shadow-xl transition-all active:scale-95 italic"
          >
            {loading ? 'PROCESANDO...' : isEdit ? 'ACTUALIZAR FICHA' : 'GUARDAR TRABAJADOR'}
          </button>
        </form>
      </Modal>
    </Container>
  )
}

export default Nomina
