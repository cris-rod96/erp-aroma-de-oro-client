import { useState, useMemo } from 'react'
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
} from 'react-icons/md'
import { usePrestamos } from '../../hooks/usePrestamos'
import { Container } from '../../components/index.components'
import { formatFecha } from '../../utils/fromatters'

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
  } = usePrestamos()

  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  // Cálculo sugerido de la cuota para mostrar en el formulario
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

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Préstamos a Empleados
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              Aroma de Oro | Nómina y Créditos
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <MdAccountBalanceWallet />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">
                Disponible en Caja
              </p>
              <p className="text-sm font-black text-gray-800 font-mono">
                {caja && caja?.estado === 'Abierta'
                  ? `$${caja?.saldoActual?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '-----'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* PANEL DE REGISTRO */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                <MdReceiptLong className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
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
                      className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 transition-all"
                    />
                    <button
                      onClick={buscarEmpleado}
                      className="bg-gray-900 text-amber-400 px-4 rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                    >
                      <MdPersonSearch size={20} />
                    </button>
                  </div>
                </div>

                {empleadoInfo ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-1">
                        Empleado Seleccionado
                      </p>
                      <p className="text-sm font-black text-gray-800 uppercase">
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
                          className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none"
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
                          className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-900 p-4 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-amber-400">
                          <MdEventRepeat size={18} />
                          <span className="text-[10px] font-black uppercase">
                            Pago por periodo:
                          </span>
                        </div>
                        <span className="text-lg font-black text-white font-mono">
                          ${montoCuotaSugerido.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Motivo del Préstamo
                      </label>
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Descripción..."
                        rows="2"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleGuardarPrestamo}
                      disabled={loading || !montoTotal || !cuotasPactadas || !comentario}
                      className="w-full py-4 bg-gray-900 text-amber-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Procesando...' : 'Autorizar Préstamo'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <MdErrorOutline className="text-gray-400" size={20} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Busque un empleado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LISTADO DE PRÉSTAMOS */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <MdFilterList className="text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="bg-transparent outline-none text-[11px] font-black uppercase text-gray-600 w-full md:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  {['Todos', 'Pendiente', 'Pagado'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${filtroEstado === estado ? 'bg-amber-400 text-gray-900' : 'bg-gray-200 text-gray-400'}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>

              {prestamosFiltrados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <MdSearchOff className="text-gray-100" size={120} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest">
                    Sin registros
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6 text-left">Info Préstamo</th>
                        <th className="px-8 py-6 text-left">Empleado</th>
                        <th className="px-8 py-6 text-center">Progreso</th>
                        <th className="px-8 py-6 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 uppercase font-bold text-[13px]">
                      {prestamosFiltrados.map((pres) => (
                        <tr key={pres.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <p className="text-[10px] text-gray-400 font-mono leading-none mb-1">
                              {formatFecha(pres.createdAt)}
                            </p>
                            <p className="text-gray-800">
                              ${parseFloat(pres.montoTotal).toFixed(2)}
                            </p>
                            <span className="text-[9px] text-amber-600 font-black italic lowercase leading-tight">
                              "{pres.comentario}"
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-gray-800 leading-none">
                              {pres.Persona?.nombreCompleto}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">
                              {pres.Persona?.numeroIdentificacion}
                            </p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black ${pres.estado === 'PENDIENTE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}
                              >
                                {pres.cuotasPagadas} / {pres.cuotasPactadas} CUOTAS
                              </span>
                              <div className="w-24 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 transition-all"
                                  style={{
                                    width: `${(pres.cuotasPagadas / pres.cuotasPactadas) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <p className="text-base font-black font-mono text-gray-900">
                              ${parseFloat(pres.saldoPendiente).toFixed(2)}
                            </p>
                            <p className="text-[9px] text-gray-400 uppercase">Faltante</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Prestamos
