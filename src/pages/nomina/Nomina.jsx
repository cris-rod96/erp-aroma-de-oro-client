import { useState, useEffect } from 'react'
import { FaPlus, FaHistory, FaUsers, FaHandHoldingUsd, FaPhone, FaIdCard } from 'react-icons/fa'
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
    tipoPeriodo: 'Jornal',
    unidadesTrabajadas: 1,
    sueldoBase: 15,
    bono: 0,
    descuentoGeneral: 0,
    descuentoPrestamo: 0,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [pagoData, setPagoData] = useState(initialPagoState)

  // --- STORES ---
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.data)
  const caja = useCajaStore((state) => state.caja)
  const setCaja = useCajaStore((state) => state.setCaja)
  const empresa = useEmpresaStore((store) => store.empresa)

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
    try {
      const resp = await trabajadorAPI.listarTodos(token)
      const data = resp.data.trabajadores || resp.data || []
      setTrabajadores(data.filter((t) => t.tipo === 'Trabajador'))
    } catch (error) {
      console.error(error)
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
      console.error(error)
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
      Swal.fire('Error', 'No se pudo guardar el registro', 'error')
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
        Swal.fire('Eliminado', 'Registro borrado', 'success')
        fetchTrabajadores()
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
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

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        <NominaHeader
          activeTab={activeTab}
          handleOpenModal={handleAbrirNuevo} // Llama al método de limpieza
          setActiveTab={setActiveTab}
        />

        <NominaTable
          activeTab={activeTab}
          data={activeTab === 'empleados' ? trabajadores : pagos}
          fetching={fetching}
          handleDelete={handleDeleteTrabajador}
          handleEdit={handleEditTrabajador}
          handleImprimir={handleImprimir}
          handleOpenPago={handleOpenPago}
        />
      </div>

      {/* MODAL PAGO */}
      <Modal
        show={isPagoModalOpen}
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        title={`Liquidación: ${selectedTrabajador?.nombreCompleto}`}
      >
        <form onSubmit={handleConfirmarPago} className="space-y-5">
          {prestamoActivo && (
            <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <FaHandHoldingUsd className="text-amber-600" size={20} />
                <div>
                  <p className="text-[9px] font-black text-amber-800 uppercase">Saldo Préstamo</p>
                  <p className="text-lg font-black text-gray-900">
                    ${parseFloat(prestamoActivo.saldoPendiente).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-600 uppercase">Cuota Pactada</p>
                <p className="text-md font-black text-emerald-700">
                  ${parseFloat(prestamoActivo.montoCuota).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Periodo</label>
              <select
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-amber-400"
                value={pagoData.tipoPeriodo}
                onChange={(e) => setPagoData({ ...pagoData, tipoPeriodo: e.target.value })}
              >
                <option value="Jornal">JORNAL</option>
                <option value="Semanal">SEMANAL</option>
                <option value="Quincenal">QUINCENAL</option>
                <option value="Mensual">MENSUAL</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Unidades
              </label>
              <input
                type="number"
                disabled={pagoData.tipoPeriodo !== 'Jornal'}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-black font-mono outline-none disabled:opacity-50"
                value={pagoData.unidadesTrabajadas}
                onChange={(e) => setPagoData({ ...pagoData, unidadesTrabajadas: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Sueldo Base ($)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-black font-mono outline-none"
                value={pagoData.sueldoBase}
                onChange={(e) => setPagoData({ ...pagoData, sueldoBase: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-500 uppercase ml-2">
                Bono (+)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full h-12 bg-emerald-50 border border-emerald-100 rounded-xl px-4 text-xs font-black font-mono outline-none"
                value={pagoData.bono}
                onChange={(e) => setPagoData({ ...pagoData, bono: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-500 uppercase ml-2">
              Descuento Préstamo (-)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full h-12 bg-red-50 border border-red-100 rounded-xl px-4 text-xs font-black font-mono outline-none"
              value={pagoData.descuentoPrestamo}
              onChange={(e) => setPagoData({ ...pagoData, descuentoPrestamo: e.target.value })}
            />
          </div>

          <div className="bg-gray-900 rounded-[2rem] p-6 flex justify-between items-center border-b-4 border-amber-500 shadow-xl">
            <div>
              <p className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">
                Neto a Recibir
              </p>
              <p className="text-3xl font-black text-white italic font-mono tracking-tighter">
                ${totalPagar.toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 text-amber-950 px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-300 transition-all active:scale-95 shadow-lg flex items-center gap-2 italic"
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <MdPayments size={16} /> Pagar
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
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Dirección</label>
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
