import { useState, useMemo, useEffect } from 'react' // Añadido useEffect
import {
  MdAddCircle,
  MdAccountBalanceWallet,
  MdPersonSearch,
  MdFilterList,
  MdSearchOff,
  MdPendingActions,
  MdCheckCircle,
  MdErrorOutline,
  MdPrint,
  MdSecurity,
  MdChevronLeft, // Nuevo
  MdChevronRight, // Nuevo
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useAnticipos } from '../../hooks/useAnticipos'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { formatFecha } from '../../utils/fromatters'
import { exportarAnticipoPDF } from '../../utils/anticipoReport'

const Anticipos = () => {
  const {
    loading,
    productorInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    buscarProductor,
    montoEntregar,
    setMontoEntregar,
    comentario,
    setComentario,
    handleGuardarAnticipo,
    anticiposGlobales,
    cajaActual,
    saldoDeudaProductor,
    error,
  } = useAnticipos()

  const empresa = useEmpresaStore((state) => state.empresa)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Lógica de filtrado para la tabla de historial
  const anticiposFiltrados = useMemo(() => {
    return anticiposGlobales.filter((ant) => {
      const matchTexto = ant.Persona?.nombreCompleto
        ?.toLowerCase()
        .includes(filtroTexto.toLowerCase())
      const matchEstado = filtroEstado === 'TODOS' ? true : ant.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [anticiposGlobales, filtroTexto, filtroEstado])

  // Cálculos de paginación sobre los filtrados
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = anticiposFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(anticiposFiltrados.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear a pág 1 si cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filtroTexto, filtroEstado, anticiposGlobales.length])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER INFORMATIVO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none italic">
              Gestión de Anticipos
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Aroma de Oro | Finanzas y Cacao
            </p>
          </div>
          {!error && (
            <div className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center text-2xl shadow-lg shadow-amber-200">
                <MdAccountBalanceWallet />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest">
                  Efectivo en Caja
                </p>
                <p className="text-xl font-black text-gray-900 font-mono mt-1">
                  ${' '}
                  {cajaActual?.saldoActual?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ||
                    '0.00'}
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
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* FORMULARIO (Mantenemos tu lógica igual) */}
            <div className="lg:col-span-4">
              {/* ... (Tu div de formulario se mantiene igual, se ve excelente) */}
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                  <MdAddCircle className="text-amber-500" size={28} />
                  <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter italic">
                    Nuevo Anticipo
                  </h2>
                </div>
                {/* Inputs de búsqueda, etc (omitido para brevedad, pero mantenlos igual) */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Identificación del Productor
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cedulaBusqueda}
                        onChange={(e) => setCedulaBusqueda(e.target.value)}
                        placeholder="Ej: 09..."
                        className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 transition-all uppercase"
                      />
                      <button
                        onClick={buscarProductor}
                        className="bg-gray-900 text-amber-400 px-4 rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                      >
                        <MdPersonSearch size={20} />
                      </button>
                    </div>
                  </div>
                  {/* Resto del formulario... */}
                  {productorInfo ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-gray-900 p-5 rounded-[2rem] border border-gray-800 shadow-xl">
                        <p className="text-[9px] font-black text-amber-400 uppercase mb-1 tracking-widest">
                          Beneficiario
                        </p>
                        <p className="text-sm font-black text-white uppercase leading-tight italic">
                          {productorInfo.nombreCompleto}
                        </p>
                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-800">
                          <span className="text-[10px] font-black text-gray-500 uppercase">
                            Deuda Actual
                          </span>
                          <span className="text-xs font-black text-rose-400 font-mono">
                            ${saldoDeudaProductor.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Monto ($)
                          </label>
                          <input
                            type="number"
                            value={montoEntregar}
                            onChange={(e) => setMontoEntregar(e.target.value)}
                            className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl px-6 text-xl font-black font-mono outline-none transition-all shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Concepto
                          </label>
                          <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Razón del anticipo..."
                            rows="2"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none transition-all resize-none shadow-inner"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleGuardarAnticipo}
                        disabled={loading || !montoEntregar || !comentario}
                        className="w-full py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 italic"
                      >
                        {loading ? 'Procesando...' : 'Confirmar Anticipo'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
                      <MdErrorOutline className="text-gray-300" size={24} />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-relaxed">
                        Ingrese cédula para habilitar el registro
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA DE HISTORIAL CON PAGINACIÓN */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                {/* Filtros */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <MdFilterList className="text-amber-500" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por productor..."
                      value={filtroTexto}
                      onChange={(e) => setFiltroTexto(e.target.value)}
                      className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 placeholder:text-gray-300 w-full md:w-64 tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['TODOS', 'Pendiente', 'Aplicado'].map((estado) => (
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

                {/* Tabla */}
                {anticiposFiltrados.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <MdSearchOff className="text-gray-100" size={120} />
                    <p className="text-gray-400 text-xs font-black uppercase mt-6 tracking-[0.3em]">
                      Sin resultados encontrados
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                          <tr>
                            <th className="px-8 py-6 text-left">Emisión</th>
                            <th className="px-8 py-6 text-left">Productor / Detalle</th>
                            <th className="px-8 py-6 text-center">Estado</th>
                            <th className="px-8 py-6 text-right">Monto</th>
                            <th className="px-8 py-6 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {currentItems.map((ant) => (
                            <tr
                              key={ant.id}
                              className="hover:bg-amber-50/20 transition-colors group"
                            >
                              <td className="px-8 py-5 text-gray-500 font-mono text-xs">
                                {formatFecha(ant.fechaEmision)}
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-sm font-black text-gray-800 leading-none mb-1 uppercase tracking-tighter">
                                  {ant.Persona?.nombreCompleto}
                                </p>
                                <span className="text-[10px] text-amber-600 font-bold italic tracking-tight">
                                  "{ant.comentario}"
                                </span>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${ant.estado === 'Pendiente' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                                >
                                  {ant.estado === 'Pendiente' ? (
                                    <MdPendingActions size={14} />
                                  ) : (
                                    <MdCheckCircle size={14} />
                                  )}
                                  {ant.estado}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
                                ${parseFloat(ant.monto).toFixed(2)}
                              </td>
                              <td className="px-8 py-5 text-center">
                                <button
                                  onClick={() => exportarAnticipoPDF(ant, empresa)}
                                  className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 transition-all shadow-md active:scale-95 border border-gray-700"
                                  title="Imprimir"
                                >
                                  <MdPrint size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* --- CONTROLES DE PAGINACIÓN --- */}
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> a{' '}
                        <span className="text-gray-900">
                          {Math.min(indexOfLastItem, anticiposFiltrados.length)}
                        </span>{' '}
                        de <span className="text-gray-900">{anticiposFiltrados.length}</span>{' '}
                        registros
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

export default Anticipos
