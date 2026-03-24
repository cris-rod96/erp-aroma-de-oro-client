import { useState, useEffect, useMemo } from 'react'
import {
  MdPayments,
  MdAttachMoney,
  MdReceipt,
  MdSearch,
  MdInbox,
  MdAccountBalanceWallet,
  MdCalendarMonth,
  MdTrendingUp,
} from 'react-icons/md'
import { FaHistory, FaUserCircle } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { abonoPorCobrarAPI, cuentasPorCobrarAPI } from '../../api/index.api'
import Swal from 'sweetalert2'
import { useCajaStore } from '../../store/useCajaStore'

const CuentasPorCobrar = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.data)
  const setCaja = useCajaStore((store) => store.setCaja)
  const caja = useCajaStore((state) => state.caja)

  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCuenta, setSelectedCuenta] = useState(null)
  const [formData, setFormData] = useState({ monto: '', metodoCobro: 'Efectivo' })
  const [processing, setProcessing] = useState(false)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchCuentas = async () => {
    try {
      setLoading(true)
      const resp = await cuentasPorCobrarAPI.listarTodas(token)
      setCuentas(resp.data?.cuentasPorCobrar || [])
    } catch (error) {
      console.error('Error Aroma de Oro:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  const handleOpenCobro = (cuenta) => {
    setSelectedCuenta(cuenta)
    setFormData({ monto: cuenta.montoPorCobrar, metodoCobro: 'Efectivo' })
    setIsModalOpen(true)
  }

  const handleOpenHistory = async (cuenta) => {
    setSelectedCuenta(cuenta)
    setIsHistoryOpen(true)
    setLoadingHistory(true)
    try {
      const resp = await abonoPorCobrarAPI.obtenerHistorialPorCxc(cuenta.id, token)
      setHistoryData(resp.data?.abonos || [])
    } catch (error) {
      setHistoryData([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const getDetallesOrigen = (c) => {
    if (!c) return { sujeto: '', detalle: '', color: 'text-gray-400' }
    switch (c.origen) {
      case 'Anticipo':
        return {
          sujeto: c.Anticipo?.Persona?.nombreCompleto || 'PRODUCTOR',
          detalle: 'ANTICIPO DE COSECHA',
          color: 'text-emerald-600',
          fecha: c.Anticipo?.fechaEmision,
        }
      case 'Préstamo':
        return {
          sujeto: c.Prestamo?.Persona?.nombreCompleto || 'TRABAJADOR',
          detalle: `CUOTAS: ${c.Prestamo?.cuotasPagadas}/${c.Prestamo?.cuotasPactadas}`,
          color: 'text-blue-600',
          fecha: c.Prestamo?.fechaPrestamo,
        }
      case 'Venta':
        return {
          sujeto: c.Ventum?.Cliente?.nombreCompleto || 'CLIENTE',
          detalle: 'VENTA DE INSUMOS',
          color: 'text-amber-600',
          fecha: c.Ventum?.createdAt,
        }
      default:
        return { sujeto: 'N/A', detalle: '', color: 'text-gray-400' }
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return cuentas.filter(
      (c) =>
        getDetallesOrigen(c).sujeto.toLowerCase().includes(term) ||
        c.origen.toLowerCase().includes(term)
    )
  }, [cuentas, searchTerm])

  const handleSubmitCobro = async (e) => {
    e.preventDefault()
    const valor = parseFloat(formData.monto)
    const saldoPendiente = parseFloat(selectedCuenta?.montoPorCobrar || 0)

    // Validaciones de monto
    if (!valor || valor <= 0) {
      return Swal.fire({
        title: 'Monto Inválido',
        text: 'Por favor ingrese un monto mayor a cero',
        icon: 'warning',
        confirmButtonColor: '#111827',
      })
    }

    if (valor > saldoPendiente) {
      return Swal.fire({
        title: 'Excede el Saldo',
        text: `El monto máximo permitido es $${saldoPendiente.toFixed(2)}`,
        icon: 'error',
        confirmButtonColor: '#111827',
      })
    }

    setProcessing(true)
    try {
      const payload = {
        CuentaPorCobrarId: selectedCuenta.id,
        monto: valor,
        metodoCobro: formData.metodoCobro,
        UsuarioId: user?.id,
        CajaId: caja.id,
        origen: selectedCuenta.origen,
      }

      const resp = await cuentasPorCobrarAPI.registrarCobro(token, payload)

      if (resp.status === 200) {
        Swal.fire({
          title: 'Cobro Registrado',
          text: 'El ingreso se ha reflejado en caja correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        })
        setIsModalOpen(false)
        fetchCuentas()
        // Actualizamos la caja global con el nuevo saldo
        if (resp.data.caja) setCaja(resp.data.caja)
      }
    } catch (error) {
      Swal.fire({
        title: 'Error de Aroma de Oro',
        text: error.response?.data?.message || 'No se pudo procesar el cobro',
        icon: 'error',
        confirmButtonColor: '#111827',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6 space-y-8">
        {/* CABECERA ESTILO AROMA DE ORO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              Cuentas por Cobrar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Cartera Activa Aroma de Oro
            </p>
          </div>

          <div className="relative group">
            <MdSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="BUSCAR CLIENTE O DOCUMENTO..."
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/5 transition-all w-full md:w-80 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Origen / Fecha
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Sujeto Asociado
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Saldo Pendiente
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Gestión
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest"
                    >
                      Sincronizando cartera...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((c) => {
                    const info = getDetallesOrigen(c)
                    return (
                      <tr key={c.id} className="hover:bg-amber-50/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <MdReceipt size={18} />
                            </div>
                            <div>
                              <p
                                className={`text-[11px] font-black uppercase tracking-tighter ${info.color}`}
                              >
                                {c.origen}
                              </p>
                              <p className="text-[9px] text-gray-400 font-bold mt-0.5 flex items-center gap-1 uppercase">
                                <MdCalendarMonth size={10} />{' '}
                                {info.fecha
                                  ? new Date(info.fecha).toLocaleDateString('es-EC')
                                  : '--'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-gray-800 uppercase italic tracking-tighter leading-none">
                            {info.sujeto}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-widest">
                            {info.detalle}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-lg font-black font-mono text-gray-900 italic">
                            ${parseFloat(c.montoPorCobrar).toFixed(2)}
                          </span>
                          <p className="text-[9px] text-gray-300 font-black uppercase tracking-tighter">
                            Inicial: ${parseFloat(c.montoTotal).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenCobro(c)}
                              className="bg-gray-900 text-amber-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest border-b-4 border-amber-600 hover:bg-black transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                            >
                              <MdPayments size={14} /> Cobrar
                            </button>
                            <button
                              onClick={() => handleOpenHistory(c)}
                              className="p-2.5 text-gray-400 border border-gray-100 rounded-xl hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                            >
                              <FaHistory size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-24 text-center text-gray-300 uppercase font-black text-xs tracking-widest"
                    >
                      <MdInbox size={48} className="mx-auto mb-2 opacity-20" /> Sin cuentas
                      pendientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER TOTALIZADOR */}
          <div className="bg-gray-900 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/10 rounded-2xl text-amber-400 border border-amber-400/20">
                <MdTrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] leading-none">
                  Cartera Total
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">
                  Registros Activos: {filtered.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-white tracking-tighter italic">
                $
                {filtered
                  .reduce((acc, c) => acc + parseFloat(c.montoPorCobrar), 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] mt-1 text-center md:text-right">
                Aroma de Oro | Auditoría
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL COBRO PREMIUM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Ingreso de Cartera"
      >
        <form onSubmit={handleSubmitCobro} className="space-y-6">
          <div className="bg-amber-50 rounded-[1.5rem] p-6 border border-amber-100 flex justify-between items-center shadow-inner">
            <span className="text-[11px] font-black uppercase text-amber-700 tracking-widest">
              Saldo Pendiente:
            </span>
            <span className="text-2xl font-black text-amber-900 font-mono italic underline decoration-amber-300 decoration-4 underline-offset-4">
              ${parseFloat(selectedCuenta?.montoPorCobrar || 0).toFixed(2)}
            </span>
          </div>

          <div className="space-y-4 font-black">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">
                Valor del Abono / Cobro
              </label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 focus-within:border-amber-400 focus-within:bg-white transition-all h-16 shadow-sm">
                <MdAttachMoney className="text-amber-500 mr-2" size={24} />
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  required
                  className="w-full text-2xl font-black font-mono outline-none bg-transparent text-gray-800"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">
                Forma de Ingreso
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Efectivo', 'Transferencia', 'Depósito', 'Tarjeta'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, metodoCobro: m })}
                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.metodoCobro === m ? 'bg-gray-900 border-gray-900 text-amber-400 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black border-b-4 border-amber-600 transition-all active:scale-95 italic"
            >
              {processing ? 'Procesando...' : 'Confirmar Cobro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL HISTORIAL REDISEÑADO */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Historial de Movimientos"
      >
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loadingHistory ? (
            <div className="py-20 text-center animate-pulse text-gray-300 font-black uppercase text-[10px] tracking-widest">
              Consultando registros...
            </div>
          ) : historyData.length > 0 ? (
            historyData.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-[1.2rem] border border-gray-100 group hover:border-amber-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <MdAccountBalanceWallet size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-800 uppercase leading-none">
                      {h.metodoCobro || 'EFECTIVO'}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">
                      {new Date(h.createdAt).toLocaleString('es-EC')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600 font-mono tracking-tighter italic">
                    +${parseFloat(h.monto).toFixed(2)}
                  </p>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                    Completado
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-200 uppercase text-[10px] font-black italic tracking-widest">
              Sin abonos registrados
            </div>
          )}
        </div>
        <button
          onClick={() => setIsHistoryOpen(false)}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest mt-6 shadow-lg shadow-gray-200 active:scale-95 transition-all"
        >
          Cerrar Historial
        </button>
      </Modal>
    </Container>
  )
}

export default CuentasPorCobrar
