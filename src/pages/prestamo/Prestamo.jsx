import { useState, useMemo, useEffect } from 'react'
import {
  MdAccountBalanceWallet,
  MdPersonSearch,
  MdFilterList,
  MdSearchOff,
  MdErrorOutline,
  MdReceiptLong,
  MdEventRepeat,
  MdPrint,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdWarning,
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
    trabajadoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarEmpleado,
    saldoDeudaEmpleado,
  } = usePrestamos()

  const empresa = useEmpresaStore((state) => state.empresa)
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const montoCuotaSugerido = useMemo(() => {
    if (!montoTotal || !cuotasPactadas || cuotasPactadas <= 0) return 0
    return parseFloat(montoTotal) / parseInt(cuotasPactadas)
  }, [montoTotal, cuotasPactadas])

  const prestamosFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    return prestamosGlobales.filter((pres) => {
      const nombre = (pres.Persona?.nombreCompleto || '').toLowerCase()
      const cedula = (pres.Persona?.numeroIdentificacion || '').toLowerCase()
      const matchTexto =
        termino === '' ? true : nombre.includes(termino) || cedula.includes(termino)
      const matchEstado = filtroEstado === 'Todos' ? true : pres.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [prestamosGlobales, cedulaBusqueda, filtroEstado])

  useEffect(() => {
    setCurrentPage(1)
  }, [cedulaBusqueda, filtroEstado])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = prestamosFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(prestamosFiltrados.length / itemsPerPage)

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
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
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none tracking-widest text-center">
                  Disponible en Caja
                </p>
                <p className="text-xl font-black text-gray-900 font-mono mt-1 text-center">
                  ${' '}
                  {caja?.saldoActual?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ||
                    '0.00'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                <MdReceiptLong className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter italic">
                  Nuevo Crédito
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Empleado (Nombre o Cédula)
                  </label>
                  <input
                    type="text"
                    value={cedulaBusqueda}
                    onChange={(e) => {
                      setCedulaBusqueda(e.target.value)
                      setMostrarSugerencias(true)
                    }}
                    placeholder="BUSCAR..."
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 uppercase transition-all"
                  />
                  {mostrarSugerencias && trabajadoresFiltrados.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-2xl max-h-60 overflow-y-auto">
                      {trabajadoresFiltrados.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => seleccionarEmpleado(t)}
                          className="p-4 border-b border-gray-50 hover:bg-amber-50 cursor-pointer"
                        >
                          <p className="text-xs font-black text-gray-800 uppercase">
                            {t.nombreCompleto}
                          </p>
                          <p className="text-[9px] text-gray-400 font-mono mt-1">
                            {t.numeroIdentificacion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {empleadoInfo ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div
                      className={`p-5 rounded-[2rem] border-2 border-dashed ${saldoDeudaEmpleado > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-900 border-gray-800 shadow-xl'}`}
                    >
                      <p
                        className={`text-[9px] font-black uppercase mb-1 tracking-widest text-center ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-amber-400'}`}
                      >
                        Empleado Seleccionado
                      </p>
                      <p
                        className={`text-sm font-black uppercase leading-tight italic text-center ${saldoDeudaEmpleado > 0 ? 'text-gray-800' : 'text-white'}`}
                      >
                        {empleadoInfo.nombreCompleto}
                      </p>
                      <div
                        className={`flex justify-between mt-4 pt-4 border-t ${saldoDeudaEmpleado > 0 ? 'border-rose-200' : 'border-gray-700'}`}
                      >
                        <span
                          className={`text-[10px] font-black uppercase ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-gray-400'}`}
                        >
                          Deuda Activa
                        </span>
                        <span
                          className={`text-xs font-black font-mono ${saldoDeudaEmpleado > 0 ? 'text-rose-600' : 'text-emerald-400'}`}
                        >
                          ${saldoDeudaEmpleado.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {saldoDeudaEmpleado > 0 ? (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3 items-center">
                        <MdWarning className="text-amber-600" size={24} />
                        <p className="text-[9px] font-black text-amber-800 uppercase leading-tight">
                          Este empleado ya tiene un préstamo activo. Bloqueado hasta cancelar deuda.
                        </p>
                      </div>
                    ) : (
                      <>
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
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 border-dashed flex justify-between items-center">
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
                        <textarea
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="MOTIVO / DESCRIPCIÓN"
                          rows="2"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none resize-none shadow-inner uppercase"
                        />
                        <button
                          onClick={handleGuardarPrestamo}
                          disabled={loading || !montoTotal || !cuotasPactadas || !comentario}
                          className="w-full py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all italic"
                        >
                          {loading ? 'PROCESANDO...' : 'AUTORIZAR PRÉSTAMO'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
                    <MdErrorOutline className="text-gray-300" size={24} />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                      Busque un empleado para continuar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <MdFilterList className="text-amber-500" size={20} />
                  <input
                    type="text"
                    placeholder="BUSCAR EMPLEADO O CÉDULA..."
                    value={cedulaBusqueda}
                    onChange={(e) => setCedulaBusqueda(e.target.value)}
                    className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 w-full md:w-64 tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  {['Todos', 'PENDIENTE', 'PAGADO'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroEstado === estado ? 'bg-gray-900 text-amber-400 shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
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
                      <th className="px-8 py-6 text-left">Info Crédito</th>
                      <th className="px-8 py-6 text-left">Empleado</th>
                      <th className="px-8 py-6 text-center">Cuotas / Progreso</th>
                      <th className="px-8 py-6 text-right">Saldo Faltante</th>
                      <th className="px-8 py-6 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((pres) => (
                      <tr key={pres.id} className="hover:bg-amber-50/20 transition-colors">
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
                            className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all"
                          >
                            <MdPrint size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Mostrando{' '}
                  <span className="text-gray-900">
                    {prestamosFiltrados.length > 0 ? indexOfFirstItem + 1 : 0}
                  </span>{' '}
                  a{' '}
                  <span className="text-gray-900">
                    {Math.min(indexOfLastItem, prestamosFiltrados.length)}
                  </span>{' '}
                  de <span className="text-gray-900">{prestamosFiltrados.length}</span> créditos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <MdChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)]
                      .map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
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
      </div>
    </Container>
  )
}

export default Prestamos
