import { useState, useMemo } from 'react'
import {
  MdAddCircle,
  MdAccountBalanceWallet,
  MdPersonSearch,
  MdKeyboardArrowDown,
  MdFilterList,
  MdSearchOff,
  MdPendingActions,
  MdCheckCircle,
  MdHistory,
  MdErrorOutline,
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useAnticipos } from '../../hooks/useAnticipos'
import { formatFecha } from '../../utils/fromatters'

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
  } = useAnticipos()

  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const anticiposFiltrados = useMemo(() => {
    return anticiposGlobales.filter((ant) => {
      const matchTexto = ant.Persona?.nombreCompleto
        ?.toLowerCase()
        .includes(filtroTexto.toLowerCase())
      const matchEstado = filtroEstado === 'TODOS' ? true : ant.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [anticiposGlobales, filtroTexto, filtroEstado])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Gestión de Anticipos
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              Aroma de Oro | Finanzas
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <MdAccountBalanceWallet />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">
                Saldo en Caja
              </p>
              <p className="text-lg font-black text-gray-800 font-mono">
                ${cajaActual?.saldoActual?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* PANEL DE REGISTRO */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                <MdAddCircle className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                  Nuevo Anticipo
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Cédula del Productor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cedulaBusqueda}
                      onChange={(e) => setCedulaBusqueda(e.target.value)}
                      placeholder="Buscar..."
                      className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 transition-all"
                    />
                    <button
                      onClick={buscarProductor}
                      className="bg-gray-900 text-amber-400 px-4 rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                    >
                      <MdPersonSearch size={20} />
                    </button>
                  </div>
                </div>

                {productorInfo ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-1">
                        Beneficiario
                      </p>
                      <p className="text-sm font-black text-gray-800 uppercase">
                        {productorInfo.nombreCompleto}
                      </p>
                      <div className="flex justify-between mt-3 pt-3 border-t border-amber-200">
                        <span className="text-[10px] font-black text-gray-500 uppercase">
                          Deuda actual
                        </span>
                        <span className="text-xs font-black text-rose-600 font-mono">
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
                          className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl px-6 text-lg font-black font-mono outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Comentario / Razón
                        </label>
                        <textarea
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Razón obligatoria..."
                          rows="2"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleGuardarAnticipo}
                      disabled={loading || !montoEntregar || !comentario}
                      className="w-full py-4 bg-gray-900 text-amber-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Registrando...' : 'Confirmar Anticipo'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <MdErrorOutline className="text-gray-400" size={20} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Busque un productor
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LISTADO DE ANTICIPOS */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <MdFilterList className="text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="bg-transparent outline-none text-[11px] font-black uppercase text-gray-600 placeholder:text-gray-300 w-full md:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  {['TODOS', 'Pendiente', 'Aplicado'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${filtroEstado === estado ? 'bg-amber-400 text-gray-900 shadow-sm' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>

              {anticiposFiltrados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <MdSearchOff className="text-gray-100" size={120} />
                  <p className="text-gray-400 text-sm font-black uppercase mt-6 tracking-widest">
                    Sin anticipos
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6 text-left">Fecha</th>
                        <th className="px-8 py-6 text-left">Productor / Razón</th>
                        <th className="px-8 py-6 text-center">Estado</th>
                        <th className="px-8 py-6 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 uppercase font-bold text-[13px]">
                      {anticiposFiltrados.map((ant) => (
                        <tr key={ant.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-8 py-5 text-gray-500 font-mono text-xs">
                            {formatFecha(ant.fechaEmision)}
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-gray-800 leading-none mb-1">
                              {ant.Persona?.nombreCompleto}
                            </p>
                            <span className="text-[10px] text-amber-600 font-black italic lowercase leading-tight">
                              "{ant.comentario}"
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[10px] font-black ${ant.estado === 'Pendiente' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}
                            >
                              {ant.estado === 'Pendiente' ? (
                                <MdPendingActions size={14} />
                              ) : (
                                <MdCheckCircle size={14} />
                              )}
                              {ant.estado}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-gray-900 text-base">
                            ${parseFloat(ant.monto).toFixed(2)}
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

export default Anticipos
