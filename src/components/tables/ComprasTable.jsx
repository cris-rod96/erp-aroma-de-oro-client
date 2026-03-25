import { useState, useEffect } from 'react'
import { MdPrint, MdVisibility, MdInbox, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { exportarLiquidacionPDF } from '../../utils/liquidacionReport'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const ComprasTable = ({ liquidaciones = [], setSelectedLiq, setShowModal }) => {
  const empresa = useEmpresaStore((store) => store.empresa)

  // --- LÓGICA DE PAGINACIÓN (ESTÁNDAR AROMA DE ORO) ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = liquidaciones.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(liquidaciones.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear a pág 1 si cambia la data
  useEffect(() => {
    setCurrentPage(1)
  }, [liquidaciones.length])

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5 text-left">Expediente</th>
              <th className="px-6 py-5 text-left">Productor</th>
              <th className="px-6 py-5 text-center">Peso Neto</th>
              <th className="px-6 py-5 text-right">Total Neto</th>
              <th className="px-6 py-5 text-right text-emerald-600">Abonado</th>
              <th className="px-6 py-5 text-right">Saldo</th>
              <th className="px-6 py-5 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 bg-white">
            {liquidaciones.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MdInbox size={60} className="text-gray-100 mb-4" />
                    <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">
                      No hay liquidaciones registradas
                    </p>
                    <span className="text-[9px] text-gray-300 font-bold uppercase mt-2">
                      Las compras de cacao o maíz aparecerán en este listado
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((liq) => (
                <tr key={liq.id} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                      {liq.codigo}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1">
                      {new Date(liq.createdAt).toLocaleDateString('es-EC')}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs font-bold text-gray-600 uppercase italic">
                    {liq.Persona?.nombreCompleto}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-black text-blue-600 text-sm">
                      {parseFloat(liq.DetalleLiquidacion?.cantidadNeta || 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 ml-1 uppercase">QQ</span>
                  </td>

                  <td className="px-6 py-4 text-right font-black text-gray-900 text-sm">
                    ${parseFloat(liq.totalAPagar || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 bg-emerald-50/30">
                    ${parseFloat(liq.montoAbonado || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {parseFloat(liq.montoPorPagar) > 0 ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="text-[11px] font-black text-orange-600 font-mono">
                          ${parseFloat(liq.montoPorPagar).toFixed(2)}
                        </span>
                        <span className="flex items-center text-[8px] font-black text-orange-400 uppercase tracking-tighter">
                          <span className="w-1 h-1 rounded-full bg-orange-400 mr-1 animate-pulse"></span>
                          Pendiente
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                        Liquidado
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLiq(liq)
                          setShowModal(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-amber-400 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 border border-gray-700 group/btn"
                      >
                        <MdVisibility
                          size={16}
                          className="group-hover/btn:scale-110 transition-transform"
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">
                          Detalle
                        </span>
                      </button>
                      <button
                        className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                        onClick={() => exportarLiquidacionPDF(liq, empresa)}
                      >
                        <MdPrint size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CONTROLES DE PAGINACIÓN (IDÉNTICO A INVENTARIO) --- */}
      <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
            Mostrando{' '}
            <span className="text-gray-900">
              {liquidaciones.length > 0 ? indexOfFirstItem + 1 : 0}
            </span>{' '}
            a{' '}
            <span className="text-gray-900">{Math.min(indexOfLastItem, liquidaciones.length)}</span>{' '}
            de <span className="text-gray-900">{liquidaciones.length}</span> expedientes
          </p>
          <span className="text-[8px] text-amber-600 font-bold uppercase mt-1 tracking-[0.2em]">
            Filtro Activo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
          >
            <MdChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1.5">
            {totalPages <= 1 ? (
              <button className="w-9 h-9 rounded-xl text-[11px] font-black bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600">
                1
              </button>
            ) : (
              [...Array(totalPages)]
                .map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${
                      currentPage === i + 1
                        ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600'
                        : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
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
    </div>
  )
}

export default ComprasTable
