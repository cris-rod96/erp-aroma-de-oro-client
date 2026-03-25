import { useState, useMemo, useEffect } from 'react'
import {
  MdAddCircle,
  MdAccountBalanceWallet,
  MdPersonSearch,
  MdFilterList,
  MdSearchOff,
  MdPendingActions,
  MdCheckCircle,
  MdErrorOutline,
  MdReceiptLong,
  MdEventRepeat,
  MdPrint,
  MdSecurity,
  MdChevronLeft, // Nuevo
  MdChevronRight, // Nuevo
} from 'react-icons/md'
import { usePrestamos } from '../../hooks/usePrestamos'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { Container } from '../../components/index.components'
import { formatFecha } from '../../utils/fromatters'
import { exportarPrestamoPDF } from '../../utils/prestamoReport'

const Prestamos = () => {
  const {
    loading,
    empleadoInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    buscarEmpleado,
    montoTotal,
    setMontoTotal,
    cuotasPactadas,
    setCuotasPactadas,
    comentario,
    setComentario,
    handleGuardarPrestamo,
    prestamosGlobales,
    caja,
    error,
  } = usePrestamos()

  const empresa = useEmpresaStore((state) => state.empresa)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const montoCuotaSugerido = useMemo(() => {
    if (!montoTotal || !cuotasPactadas || cuotasPactadas <= 0) return 0
    return parseFloat(montoTotal) / parseInt(cuotasPactadas)
  }, [montoTotal, cuotasPactadas])

  const prestamosFiltrados = useMemo(() => {
    return prestamosGlobales.filter((pres) => {
      const matchTexto = pres.Persona?.nombreCompleto
        ?.toLowerCase()
        .includes(filtroTexto.toLowerCase())
      const matchEstado = filtroEstado === 'Todos' ? true : pres.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [prestamosGlobales, filtroTexto, filtroEstado])

  // Cálculos de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = prestamosFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(prestamosFiltrados.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1)
  }, [filtroTexto, filtroEstado, prestamosGlobales.length])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none italic">
              Préstamos a Empleados
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Aroma de Oro | Nómina y Créditos
            </p>
          </div>
          {!error && (
            <div className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center text-2xl shadow-lg shadow-amber-100">
                <MdAccountBalanceWallet />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest">
                  Disponible en Caja
                </p>
                <p className="text-xl font-black text-gray-900 font-mono mt-1">
                  {caja && caja?.estado === 'Abierta'
                    ? `$${caja?.saldoActual?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '---.--'}
                </p>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-[2.5rem] shadow-xl border border-rose-100">
            <div className="bg-rose-50 p-6 rounded-[2rem] mb-4 border border-rose-100">
              <MdSecurity size={50} className="text-rose-400" />
            </div>
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto">
              {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* PANEL DE REGISTRO */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                  <MdReceiptLong className="text-amber-500" size={28} />
                  <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter italic">
                    Nuevo Crédito
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Cédula del Empleado
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cedulaBusqueda}
                        onChange={(e) => setCedulaBusqueda(e.target.value)}
                        placeholder="09..."
                        className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 transition-all uppercase"
                      />
                      <button
                        onClick={buscarEmpleado}
                        className="bg-gray-900 text-amber-400 px-4 rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                      >
                        <MdPersonSearch size={20} />
                      </button>
                    </div>
                  </div>

                  {empleadoInfo ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-gray-900 p-5 rounded-[2rem] border border-gray-800 shadow-xl">
                        <p className="text-[9px] font-black text-amber-400 uppercase mb-1 tracking-widest">
                          Empleado Seleccionado
                        </p>
                        <p className="text-sm font-black text-white uppercase leading-tight italic">
                          {empleadoInfo.nombreCompleto}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Monto Total
                          </label>
                          <input
                            type="number"
                            value={montoTotal}
                            onChange={(e) => setMontoTotal(e.target.value)}
                            className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Cuotas
                          </label>
                          <input
                            type="number"
                            value={cuotasPactadas}
                            onChange={(e) => setCuotasPactadas(e.target.value)}
                            className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 border-dashed">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-amber-600">
                            <MdEventRepeat size={18} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Pago sugerido:
                            </span>
                          </div>
                          <span className="text-lg font-black text-gray-800 font-mono">
                            ${montoCuotaSugerido.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Motivo
                        </label>
                        <textarea
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Descripción..."
                          rows="2"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none resize-none shadow-inner"
                        />
                      </div>

                      <button
                        onClick={handleGuardarPrestamo}
                        disabled={loading || !montoTotal || !cuotasPactadas || !comentario}
                        className="w-full py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 italic"
                      >
                        {loading ? 'Procesando...' : 'Autorizar Préstamo'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
                      <MdErrorOutline className="text-gray-300" size={24} />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Busque un empleado para continuar
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LISTADO DE PRÉSTAMOS CON PAGINACIÓN */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <MdFilterList className="text-amber-500" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar empleado..."
                      value={filtroTexto}
                      onChange={(e) => setFiltroTexto(e.target.value)}
                      className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 placeholder:text-gray-300 w-full md:w-64 tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['Todos', 'PENDIENTE', 'PAGADO'].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroEstado === estado ? 'bg-gray-900 text-amber-400 shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-amber-200'}`}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>

                {prestamosFiltrados.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <MdSearchOff className="text-gray-100" size={120} />
                    <p className="text-gray-400 text-xs font-black uppercase mt-6 tracking-[0.3em]">
                      Sin registros de crédito
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                          <tr>
                            <th className="px-8 py-6 text-left">Info Crédito</th>
                            <th className="px-8 py-6 text-left">Empleado</th>
                            <th className="px-8 py-6 text-center">Cuotas / Progreso</th>
                            <th className="px-8 py-6 text-right">Saldo Faltante</th>
                            <th className="px-8 py-6 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {currentItems.map((pres) => (
                            <tr
                              key={pres.id}
                              className="hover:bg-amber-50/20 transition-colors group"
                            >
                              <td className="px-8 py-5">
                                <p className="text-[10px] text-gray-400 font-mono mb-1">
                                  {formatFecha(pres.createdAt)}
                                </p>
                                <p className="text-sm font-black text-gray-800 leading-none tracking-tighter">
                                  ${parseFloat(pres.montoTotal).toFixed(2)}
                                </p>
                                <span className="text-[10px] text-amber-600 font-bold italic tracking-tight lowercase">
                                  "{pres.comentario}"
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-sm font-black text-gray-800 leading-none uppercase tracking-tighter">
                                  {pres.Persona?.nombreCompleto}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono mt-1">
                                  {pres.Persona?.numeroIdentificacion}
                                </p>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${pres.estado === 'PENDIENTE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                                  >
                                    {pres.cuotasPagadas} / {pres.cuotasPactadas} CUOTAS
                                  </span>
                                  <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden border border-gray-50">
                                    <div
                                      className="h-full bg-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                      style={{
                                        width: `${(pres.cuotasPagadas / pres.cuotasPactadas) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
                                ${parseFloat(pres.saldoPendiente).toFixed(2)}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <button
                                  onClick={() => exportarPrestamoPDF(pres, empresa)}
                                  className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 transition-all shadow-md active:scale-95 border border-gray-700"
                                >
                                  <MdPrint size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINACIÓN ESTÁNDAR */}
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> a{' '}
                        <span className="text-gray-900">
                          {Math.min(indexOfLastItem, prestamosFiltrados.length)}
                        </span>{' '}
                        de <span className="text-gray-900">{prestamosFiltrados.length}</span>{' '}
                        créditos
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                        >
                          <MdChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          {[...Array(totalPages)]
                            .map((_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                              >
                                {i + 1}
                              </button>
                            ))
                            .slice(
                              Math.max(0, currentPage - 3),
                              Math.min(totalPages, currentPage + 2)
                            )}
                        </div>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages || totalPages === 0}
                          className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                        >
                          <MdChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Prestamos
