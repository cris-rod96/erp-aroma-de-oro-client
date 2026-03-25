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
} from 'react-icons/md'
import { FaHistory } from 'react-icons/fa'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { abonosPorPagarApi, cuentasPorPagarAPI } from '../../api/index.api'
import { formatMoney, formatFecha } from '../../utils/fromatters'
import { useCajaStore } from '../../store/useCajaStore'
import Swal from 'sweetalert2'

const CuentasPorPagar = () => {
  const token = useAuthStore((state) => state.token)
  const [deudas, setDeudas] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- LÓGICA DE PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 10

  // Estados para Modales
  const [selectedCuenta, setSelectedCuenta] = useState(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const [showPago, setShowPago] = useState(false)
  const [loadingPago, setLoadingPago] = useState(false)

  const caja = useCajaStore((store) => store.caja)
  const user = useAuthStore((store) => store.data)

  const [formData, setFormData] = useState({
    monto: '',
    metodoPago: 'Efectivo',
    notas: '',
    CajaId: caja && caja.estado === 'Abierta' ? caja.id : '',
  })

  const fetchCuentas = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await cuentasPorPagarAPI.listarTodas(token)
      setDeudas(resp.data.cuentasPorPagar || resp.data || [])
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener cuentas por pagar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  // Filtrado y reseteo de página al buscar
  const deudasFiltradas = useMemo(() => {
    setPaginaActual(1)
    return deudas.filter(
      (item) =>
        item.Liquidacion?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Liquidacion?.Persona?.nombreCompleto || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
  }, [deudas, searchTerm])

  // --- CÁLCULOS DE PAGINACIÓN ---
  const totalPaginas = Math.ceil(deudasFiltradas.length / registrosPorPagina)
  const indiceUltimoItem = paginaActual * registrosPorPagina
  const indicePrimerItem = indiceUltimoItem - registrosPorPagina
  const deudasPaginadas = useMemo(() => {
    return deudasFiltradas.slice(indicePrimerItem, indiceUltimoItem)
  }, [deudasFiltradas, paginaActual])

  const handleOpenPago = (cuenta) => {
    setSelectedCuenta(cuenta)
    setFormData({ ...formData, monto: cuenta.saldoPendiente })
    setShowPago(true)
  }

  const handleSubmitAbono = async (e) => {
    e.preventDefault()
    if (parseFloat(formData.monto) > parseFloat(selectedCuenta.saldoPendiente)) {
      return Swal.fire('Error', 'El monto no puede superar el saldo pendiente', 'error')
    }
    try {
      setLoadingPago(true)
      const payload = {
        CuentaPorPagarId: selectedCuenta.id,
        monto: formData.monto,
        metodoPago: formData.metodoPago,
        notas: formData.notas,
        CajaId: formData.CajaId,
        UsuarioId: user.id,
      }
      const resp = await abonosPorPagarApi.registrarAbono(token, payload)
      if (resp.status === 200) {
        Swal.fire('¡Éxito!', resp.data.message, 'success')
        setShowPago(false)
        fetchCuentas()
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al procesar el pago', 'error')
    } finally {
      setLoadingPago(false)
    }
  }

  const handleVerHistorial = (cuenta) => {
    setSelectedCuenta(cuenta)
    setShowHistorial(true)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Cuentas por Pagar
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Gestión de obligaciones y saldos
            </p>
          </div>
          {!error && (
            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="BUSCAR LIQUIDACIÓN O PROVEEDOR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all w-72 shadow-sm"
              />
            </div>
          )}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-2xl border border-gray-100">
            <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
              <MdSecurity size={50} className="text-rose-400" />
            </div>
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
                    <th className="px-8 py-6 text-left">Liquidación / Beneficiario</th>
                    <th className="px-6 py-6 text-left">Total Deuda</th>
                    <th className="px-6 py-6 text-center">Abonado</th>
                    <th className="px-6 py-6 text-center">Saldo Restante</th>
                    <th className="px-6 py-6 text-center">Estado</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="px-8 py-10 bg-gray-50/20"></td>
                      </tr>
                    ))
                  ) : deudasPaginadas.length > 0 ? (
                    deudasPaginadas.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-amber-50/30 transition-colors group uppercase font-bold"
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md font-mono text-[10px] font-bold">
                              {item.Liquidacion?.codigo?.split('-')[1] || 'CXP'}
                            </div>
                            <div className="ml-4 text-left">
                              <div className="text-sm font-black text-gray-900 leading-none tracking-tighter italic">
                                {item.Liquidacion?.codigo || 'S/N'}
                              </div>
                              <div className="text-[9px] text-gray-400 mt-1 tracking-widest leading-none">
                                {item.Liquidacion?.Persona?.nombreCompleto ||
                                  'Proveedor Desconocido'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-mono">
                          {formatMoney(item.montoTotal)}
                        </td>
                        <td className="px-6 py-5 text-center font-mono text-emerald-600">
                          +{formatMoney(item.montoAbonado)}
                        </td>
                        <td
                          className={`px-6 py-5 text-center font-mono text-base font-black ${parseFloat(item.saldoPendiente) > 0 ? 'text-amber-600' : 'text-gray-300'}`}
                        >
                          {formatMoney(item.saldoPendiente)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border ${item.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right flex justify-end gap-2">
                          {parseFloat(item.saldoPendiente) > 0 && (
                            <button
                              className="bg-gray-900 text-amber-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all italic shadow-lg shadow-gray-200 active:scale-95"
                              onClick={() => handleOpenPago(item)}
                            >
                              <MdPayments size={14} className="inline mr-1" /> Abonar
                            </button>
                          )}
                          <button
                            onClick={() => handleVerHistorial(item)}
                            className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-gray-100 shadow-sm"
                            title="Ver historial"
                          >
                            <FaHistory size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-24 text-center text-gray-300 font-black text-xs tracking-widest uppercase italic"
                      >
                        Sin obligaciones pendientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- FOOTER DE PAGINACIÓN ARREGLADO (ESTILO 3D) --- */}
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  Mostrando{' '}
                  <span className="text-gray-900">
                    {deudasFiltradas.length > 0 ? indicePrimerItem + 1 : 0}
                  </span>{' '}
                  a{' '}
                  <span className="text-gray-900">
                    {Math.min(indiceUltimoItem, deudasFiltradas.length)}
                  </span>{' '}
                  de <span className="text-gray-900">{deudasFiltradas.length}</span> obligaciones
                </p>
                {searchTerm && (
                  <span className="text-[8px] text-amber-600 font-bold uppercase mt-1 tracking-[0.2em]">
                    Filtro de Búsqueda Activo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1 || totalPaginas === 0}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                >
                  <MdChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1.5">
                  {totalPaginas <= 1 ? (
                    <button className="w-9 h-9 rounded-xl text-[11px] font-black bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600 italic">
                      1
                    </button>
                  ) : (
                    [...Array(totalPaginas)]
                      .map((_, i) => {
                        const num = i + 1
                        const esActiva = paginaActual === num
                        return (
                          <button
                            key={num}
                            onClick={() => setPaginaActual(num)}
                            className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all italic ${esActiva ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                          >
                            {num}
                          </button>
                        )
                      })
                      .slice(
                        Math.max(0, paginaActual - 3),
                        Math.min(totalPaginas, paginaActual + 2)
                      )
                  )}
                </div>

                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas || totalPaginas === 0}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                >
                  <MdChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modales de Historial y Pago se mantienen debajo... */}
      {/* MODAL HISTORIAL DE ABONOS */}
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
                    Historial de Abonos
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Ref: {selectedCuenta.Liquidacion?.codigo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistorial(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <MdClose size={28} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedCuenta.AbonosCuentasPorPagars &&
              selectedCuenta.AbonosCuentasPorPagars.length > 0 ? (
                <div className="space-y-3">
                  {selectedCuenta.AbonosCuentasPorPagars.map((abono, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-amber-200 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100">
                          <MdPayment size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-800 uppercase leading-none">
                            Pago {abono.metodoPago}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-1">
                            <MdEvent size={12} /> {formatFecha(abono.fechaPago)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black font-mono text-emerald-600">
                          +{formatMoney(abono.monto)}
                        </p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                          Procesado Correctamente
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MdInbox size={40} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase">
                    No se han registrado abonos aún
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Saldo Restante
                </p>
                <p className="text-xl font-black font-mono text-amber-600">
                  {formatMoney(selectedCuenta.saldoPendiente)}
                </p>
              </div>
              <button
                onClick={() => setShowHistorial(false)}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}

      {showPago && selectedCuenta && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
            <form onSubmit={handleSubmitAbono}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-900 text-amber-400 p-2 rounded-lg">
                    <MdPayments size={24} />
                  </div>
                  <h3 className="font-black uppercase italic text-gray-900 leading-none">
                    Registrar Abono
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPago(false)}
                  className="text-gray-400 hover:text-black"
                >
                  <MdClose size={28} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Info de la deuda */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-amber-700">
                    Saldo Pendiente:
                  </span>
                  <span className="text-xl font-black font-mono text-amber-800">
                    ${parseFloat(selectedCuenta.saldoPendiente).toFixed(2)}
                  </span>
                </div>

                {/* Input Monto */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                    Monto a abonar
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-mono font-black focus:border-amber-400 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                    Método de pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Efectivo', 'Transferencia'].map((metodo) => (
                      <button
                        key={metodo}
                        type="button"
                        onClick={() => setFormData({ ...formData, metodoPago: metodo })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.metodoPago === metodo ? 'border-gray-900 bg-gray-900 text-amber-400 shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                      >
                        {metodo === 'Efectivo' ? (
                          <MdAccountBalanceWallet className="inline mr-2" size={16} />
                        ) : (
                          <MdAccountBalanceWallet className="inline mr-2" size={16} />
                        )}
                        {metodo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                    Notas adicionales
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Opcional..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-bold outline-none focus:border-amber-400 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loadingPago}
                  className="w-full bg-gray-900 text-amber-400 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingPago ? 'Procesando...' : 'Confirmar y Aplicar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  )
}

export default CuentasPorPagar
