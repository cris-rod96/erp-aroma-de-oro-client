import { useState, useEffect, useMemo } from 'react'
import {
  MdPayments,
  MdSearch,
  MdInbox,
  MdClose,
  MdHistory,
  MdEvent,
  MdPayment,
  MdAccountBalanceWallet,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdTrendingUp,
  MdReceipt,
  MdSwapHoriz,
} from 'react-icons/md'
import { FaHistory } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { abonoPorCobrarAPI, cuentasPorCobrarAPI } from '../../api/index.api'
import { formatMoney, formatFecha } from '../../utils/fromatters'
import { useCajaStore } from '../../store/useCajaStore'
import Swal from 'sweetalert2'

const CuentasPorCobrar = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setCaja = useCajaStore((store) => store.setCaja)
  const caja = useCajaStore((state) => state.caja)

  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 8

  const [selectedCuenta, setSelectedCuenta] = useState(null)
  const [showCobro, setShowCobro] = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ESTADOS PARA EL COBRO
  const [formData, setFormData] = useState({
    monto: '',
    metodoCobro: 'Efectivo',
  })
  const [enviarACaja, setEnviarACaja] = useState(true)

  const fetchCuentas = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await cuentasPorCobrarAPI.listarTodas(token)
      const data = resp.data?.cuentasPorCobrar || []
      setCuentas(data.filter((c) => parseFloat(c.montoPorCobrar) > 0))
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener cartera')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  const getDetallesOrigen = (c) => {
    if (!c) return { sujeto: 'N/A', detalle: '', color: 'text-gray-400', identificacion: '' }
    switch (c.origen) {
      case 'Anticipo':
        return {
          sujeto: c.Anticipo?.Persona?.nombreCompleto || 'PRODUCTOR',
          detalle: 'ANTICIPO DE COSECHA',
          color: 'text-emerald-600',
          fecha: c.Anticipo?.fechaEmision,
          identificacion: c.Anticipo?.Persona?.numeroIdentificacion || '',
        }
      case 'Préstamo':
        return {
          sujeto: c.Prestamo?.Persona?.nombreCompleto || 'TRABAJADOR',
          detalle: `CUOTAS: ${c.Prestamo?.cuotasPagadas}/${c.Prestamo?.cuotasPactadas}`,
          color: 'text-blue-600',
          fecha: c.Prestamo?.fechaPrestamo,
          identificacion: c.Prestamo?.Persona?.numeroIdentificacion || '',
        }
      case 'Venta':
        return {
          sujeto: c.Ventum?.Cliente?.nombreCompleto || 'CLIENTE',
          detalle: 'VENTA DE PRODUCTOS',
          color: 'text-amber-600',
          fecha: c.Ventum?.createdAt,
          identificacion: c.Ventum?.Cliente?.numeroIdentificacion || '',
        }
      default:
        return { sujeto: 'N/A', detalle: '', color: 'text-gray-400', identificacion: '' }
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return cuentas.filter((c) => {
      const info = getDetallesOrigen(c)
      return (
        info.sujeto.toLowerCase().includes(term) ||
        c.origen.toLowerCase().includes(term) ||
        info.identificacion.toLowerCase().includes(term)
      )
    })
  }, [cuentas, searchTerm])

  const totalPaginas = Math.ceil(filtered.length / registrosPorPagina)
  const filteredPaginado = filtered.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  )

  const handleOpenCobro = (cuenta) => {
    setSelectedCuenta(cuenta)
    setFormData({ monto: cuenta.montoPorCobrar, metodoCobro: 'Efectivo' })
    setEnviarACaja(true) // Por defecto siempre asumimos que entra a caja
    setShowCobro(true)
  }

  const handleOpenHistory = async (cuenta) => {
    setSelectedCuenta(cuenta)
    setShowHistorial(true)
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

  const handleSubmitCobro = async (e) => {
    e.preventDefault()
    if (parseFloat(formData.monto) > parseFloat(selectedCuenta.montoPorCobrar)) {
      return Swal.fire('Error', 'El monto excede el saldo pendiente', 'error')
    }
    setProcessing(true)

    try {
      const payload = {
        CuentaPorCobrarId: selectedCuenta.id,
        monto: formData.monto,
        metodoCobro: formData.metodoCobro,
        UsuarioId: user?.id,
        // Solo enviamos CajaId si es Efectivo y el usuario marcó que SI entra a caja
        CajaId: formData.metodoCobro === 'Efectivo' && enviarACaja ? caja?.id : null,
        origen: selectedCuenta.origen,
        afectaCaja: formData.metodoCobro === 'Efectivo' && enviarACaja,
      }

      const resp = await cuentasPorCobrarAPI.registrarCobro(token, payload)
      if (resp.status === 200) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cobro registrado correctamente',
          icon: 'success',
          timer: 1500,
        })
        setShowCobro(false)
        fetchCuentas()
        // Actualizamos el estado global de la caja solo si el dinero entró físicamente
        if (resp.data.caja && payload.afectaCaja) {
          setCaja(resp.data.caja)
        }
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al procesar el cobro', 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">
              Cuentas por Cobrar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Cartera Activa y Recuperación
            </p>
          </div>
          {!error && (
            <div className="relative group">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR CLIENTE O IDENTIFICACIÓN..."
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none w-72 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-white py-10 text-center rounded-2xl border border-gray-100">
            <MdSecurity size={50} className="text-rose-400 mx-auto mb-4" />
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6 text-left">Origen / Fecha</th>
                    <th className="px-6 py-6 text-left">Sujeto Asociado</th>
                    <th className="px-6 py-6 text-center">Monto Inicial</th>
                    <th className="px-6 py-6 text-center">Saldo Pendiente</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="5" className="px-8 py-10 bg-gray-50/20"></td>
                      </tr>
                    ))
                  ) : filteredPaginado.length > 0 ? (
                    filteredPaginado.map((c) => {
                      const info = getDetallesOrigen(c)
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-amber-50/30 transition-colors group uppercase font-bold"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                                <MdReceipt size={18} />
                              </div>
                              <div>
                                <p
                                  className={`text-[11px] font-black tracking-tighter ${info.color}`}
                                >
                                  {c.origen}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                                  <MdEvent size={10} /> {formatFecha(info.fecha)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-gray-900 leading-none tracking-tighter italic">
                              {info.sujeto}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">
                              {info.detalle}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center font-mono text-gray-400 text-xs">
                            {formatMoney(c.montoTotal)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-lg font-black font-mono text-gray-900 italic">
                              {formatMoney(c.montoPorCobrar)}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenCobro(c)}
                              className="bg-gray-900 text-amber-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all italic shadow-lg flex items-center gap-2 active:scale-95"
                            >
                              <MdPayments size={14} /> Cobrar
                            </button>
                            <button
                              onClick={() => handleOpenHistory(c)}
                              className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-gray-100 shadow-sm"
                            >
                              <FaHistory size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-24 text-center text-gray-300 font-black text-xs tracking-widest uppercase italic"
                      >
                        Sin cuentas pendientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Mostrando{' '}
                <span className="text-gray-900">
                  {filtered.length > 0 ? (paginaActual - 1) * registrosPorPagina + 1 : 0}
                </span>{' '}
                a{' '}
                <span className="text-gray-900">
                  {Math.min(paginaActual * registrosPorPagina, filtered.length)}
                </span>{' '}
                de {filtered.length} registros
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20"
                >
                  <MdChevronLeft size={20} />
                </button>
                <button className="w-9 h-9 rounded-xl text-[11px] font-black bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600 italic">
                  {paginaActual}
                </button>
                <button
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20"
                >
                  <MdChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* TOTALIZADOR */}
            <div className="bg-gray-900 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400/10 rounded-2xl text-amber-400 border border-amber-400/20">
                  <MdTrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em] leading-none">
                    Cartera por Recuperar
                  </p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">
                    Pendientes: {filtered.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black font-mono text-white tracking-tighter italic">
                  {formatMoney(filtered.reduce((acc, c) => acc + parseFloat(c.montoPorCobrar), 0))}
                </span>
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] mt-1">
                  Aroma de Oro | Auditoría
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE COBRO CON SWITCH DE CAJA */}
      {showCobro && selectedCuenta && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
            <form onSubmit={handleSubmitCobro}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-900 text-amber-400 p-2 rounded-lg">
                    <MdPayments size={24} />
                  </div>
                  <h3 className="font-black uppercase italic text-gray-900 leading-none">
                    Registrar Ingreso
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCobro(false)}
                  className="text-gray-400 hover:text-black"
                >
                  <MdClose size={28} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest">
                    Saldo a Cobrar:
                  </span>
                  <span className="text-xl font-black font-mono text-amber-800">
                    {formatMoney(selectedCuenta.montoPorCobrar)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">
                    Monto del Cobro
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    autoFocus
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-mono font-black focus:border-amber-400 outline-none transition-all"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['Efectivo', 'Transferencia'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, metodoCobro: m })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.metodoCobro === m ? 'border-gray-900 bg-gray-900 text-amber-400 shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                      <MdAccountBalanceWallet className="inline mr-2" size={16} /> {m}
                    </button>
                  ))}
                </div>

                {/* SWITCH: ¿ENTRA A CAJA? (Solo visible si es Efectivo) */}
                {formData.metodoCobro === 'Efectivo' && (
                  <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">
                        ¿Enviar a Caja Física?
                      </span>
                      <span className="text-[8px] font-bold text-amber-600 uppercase">
                        {enviarACaja ? 'Suma al saldo actual' : 'No afecta el arqueo de hoy'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnviarACaja(!enviarACaja)}
                      className={`w-12 h-6 rounded-full transition-all relative ${enviarACaja ? 'bg-gray-900' : 'bg-gray-300'}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enviarACaja ? 'left-7' : 'left-1'}`}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gray-900 text-amber-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 italic"
                >
                  {processing ? 'Procesando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL */}
      {showHistorial && selectedCuenta && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                  <MdHistory size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-gray-900 leading-none">
                    Historial de Cobros
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Ref: {getDetallesOrigen(selectedCuenta).sujeto}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistorial(false)}
                className="text-gray-400 hover:text-black"
              >
                <MdClose size={28} />
              </button>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {loadingHistory ? (
                <p className="text-center py-10 animate-pulse font-black uppercase text-xs text-gray-300">
                  Consultando...
                </p>
              ) : historyData.length > 0 ? (
                <div className="space-y-3">
                  {historyData.map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100">
                          <MdPayment size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-800 uppercase leading-none">
                            {h.metodoCobro || 'EFECTIVO'}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-1">
                            <MdEvent size={12} /> {formatFecha(h.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black font-mono text-emerald-600">
                          +{formatMoney(h.monto)}
                        </p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                          Completado
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MdInbox size={40} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase italic">
                    Sin movimientos registrados
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowHistorial(false)}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export default CuentasPorCobrar
