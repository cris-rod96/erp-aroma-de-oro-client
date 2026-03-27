import { useState, useMemo, useEffect } from 'react'
import {
  MdAddCircle,
  MdAccountBalanceWallet,
  MdPersonSearch,
  MdFilterList,
  MdErrorOutline,
  MdPrint,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdWarning,
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
    productoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarProductor,
  } = useAnticipos()

  const empresa = useEmpresaStore((state) => state.empresa)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 1. SINCRONIZACIÓN TOTAL: Usamos cedulaBusqueda directamente para la tabla
  const anticiposFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    return anticiposGlobales.filter((ant) => {
      const matchTexto =
        termino === ''
          ? true
          : ant.Persona?.nombreCompleto?.toLowerCase().includes(termino) ||
            ant.Persona?.numeroIdentificacion?.includes(termino)

      const matchEstado = filtroEstado === 'TODOS' ? true : ant.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [anticiposGlobales, cedulaBusqueda, filtroEstado])

  // 2. LÓGICA DE PAGINACIÓN CORREGIDA
  const totalPages = Math.ceil(anticiposFiltrados.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = anticiposFiltrados.slice(indexOfFirstItem, indexOfLastItem)

  // Reset de página cuando cambia la búsqueda o el estado
  useEffect(() => {
    setCurrentPage(1)
  }, [cedulaBusqueda, filtroEstado])

  const tieneDeudaPendiente = saldoDeudaProductor > 0

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER AROMA DE ORO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
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
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest text-center">
                  Caja Actual
                </p>
                <p className="text-xl font-black text-gray-900 font-mono mt-1 text-center">
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
            <MdSecurity size={50} className="text-rose-400 mb-4" />
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* FORMULARIO IZQUIERDO */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                  <MdAddCircle className="text-amber-500" size={28} />
                  <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                    Nuevo Anticipo
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Identificación del Productor
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cedulaBusqueda}
                        onChange={(e) => {
                          setCedulaBusqueda(e.target.value)
                          setMostrarSugerencias(true)
                        }}
                        placeholder="Nombre o cédula..."
                        className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 transition-all uppercase"
                      />
                      <button
                        onClick={buscarProductor}
                        className="bg-amber-400 text-gray-900 px-4 rounded-xl hover:bg-amber-500 shadow-md transition-all active:scale-95"
                      >
                        <MdPersonSearch size={20} />
                      </button>
                    </div>

                    {mostrarSugerencias && productoresFiltrados.length > 0 && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-2xl max-h-60 overflow-y-auto">
                        {productoresFiltrados.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => seleccionarProductor(p)}
                            className="p-4 border-b border-gray-50 hover:bg-amber-50 cursor-pointer last:border-0"
                          >
                            <p className="text-xs font-black text-gray-800 uppercase">
                              {p.nombreCompleto}
                            </p>
                            <p className="text-[9px] text-gray-400 font-mono mt-1">
                              {p.numeroIdentificacion}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {productorInfo ? (
                    <div className="space-y-6">
                      <div
                        className={`p-5 rounded-[2rem] border-2 border-dashed ${tieneDeudaPendiente ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest text-center">
                          Beneficiario
                        </p>
                        <p className="text-sm font-black text-gray-800 uppercase leading-tight text-center">
                          {productorInfo.nombreCompleto}
                        </p>
                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Saldo Pendiente
                          </span>
                          <span
                            className={`text-xs font-black font-mono ${tieneDeudaPendiente ? 'text-rose-600' : 'text-emerald-600'}`}
                          >
                            ${saldoDeudaProductor.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {tieneDeudaPendiente ? (
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3 items-center">
                          <MdWarning className="text-amber-600" size={24} />
                          <p className="text-[9px] font-black text-amber-800 uppercase leading-tight">
                            Productor con anticipo activo. Bloqueado hasta liquidación.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <input
                              type="number"
                              value={montoEntregar}
                              onChange={(e) => setMontoEntregar(e.target.value)}
                              placeholder="MONTO $"
                              className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl px-6 text-xl font-black font-mono outline-none shadow-inner"
                            />
                            <textarea
                              value={comentario}
                              onChange={(e) => setComentario(e.target.value)}
                              placeholder="CONCEPTO"
                              rows="2"
                              className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none uppercase shadow-inner resize-none"
                            />
                          </div>
                          <button
                            onClick={handleGuardarAnticipo}
                            disabled={loading || !montoEntregar || !comentario}
                            className="w-full py-5 bg-amber-400 text-gray-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {loading ? 'PROCESANDO...' : 'CONFIRMAR ANTICIPO'}
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
                      <MdErrorOutline className="text-gray-300" size={24} />
                      <span className="text-[9px] font-black text-gray-400 uppercase">
                        INGRESE DATOS PARA HABILITAR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA HISTORIAL DERECHA */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <MdFilterList className="text-amber-500" size={20} />
                    <input
                      type="text"
                      placeholder="BUSCAR EN HISTORIAL..."
                      value={cedulaBusqueda} // AQUÍ ESTÁ LA MAGIA: MISMO ESTADO
                      onChange={(e) => setCedulaBusqueda(e.target.value)}
                      className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 w-full md:w-64 tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['TODOS', 'Pendiente', 'Aplicado'].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroEstado === estado ? 'bg-amber-400 text-gray-900 shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                      >
                        {estado}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6 text-left">Emisión</th>
                        <th className="px-8 py-6 text-left">Productor</th>
                        <th className="px-8 py-6 text-center">Estado</th>
                        <th className="px-8 py-6 text-right">Monto</th>
                        <th className="px-8 py-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentItems.map((ant) => (
                        <tr key={ant.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="px-8 py-5 text-gray-500 font-mono text-xs">
                            {formatFecha(ant.fechaEmision)}
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                              {ant.Persona?.nombreCompleto}
                            </p>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">
                              "{ant.comentario}"
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${ant.estado === 'Pendiente' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                            >
                              {ant.estado}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
                            ${parseFloat(ant.monto).toFixed(2)}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button
                              onClick={() => exportarAnticipoPDF(ant, empresa)}
                              className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all"
                            >
                              <MdPrint size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN ESTILO MODERNO */}
                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                  <p className="text-[10px] font-black text-gray-400 uppercase">
                    Página <span className="text-gray-900">{currentPage}</span> de{' '}
                    <span className="text-gray-900">{totalPages || 1}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
                    >
                      <MdChevronLeft size={20} />
                    </button>
                    <div className="flex gap-1.5">
                      {[...Array(totalPages)]
                        .map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                          >
                            {i + 1}
                          </button>
                        ))
                        .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
                    >
                      <MdChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Anticipos
