import { useState, useEffect } from 'react'
import { FaTrashRestore, FaUserEdit } from 'react-icons/fa'
import {
  MdDelete,
  MdInbox,
  MdLocationOn,
  MdReceiptLong,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md'

const ProductoresTable = ({
  fetching,
  productores,
  handleDelete,
  handleOpenModal,
  handleVerLiquidaciones,
  handleRestore, // <--- Nueva prop para restaurar
  error,
  verEliminados,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProductores = productores?.slice(indexOfFirstItem, indexOfLastItem) || []
  const totalPages = Math.ceil((productores?.length || 0) / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [productores?.length])

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {fetching ? (
        <div className="px-6 py-24 text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="animate-pulse text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">
            Sincronizando Directorio...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-rose-50 p-6 rounded-[2.5rem] mb-4 border-2 border-rose-100">
            <MdSecurity size={40} className="text-rose-500" />
          </div>
          <h3 className="text-gray-900 font-black uppercase text-sm tracking-widest">
            Error de Carga
          </h3>
          <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs">{error}</p>
        </div>
      ) : currentProductores.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <MdInbox size={80} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
            No se encontraron productores {verEliminados ? 'eliminados' : 'registrados'}
          </p>
        </div>
      ) : (
        <>
          {/* --- VISTA ESCRITORIO --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Productor
                  </th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Identificación
                  </th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentProductores.map((productor) => (
                  <tr
                    key={productor.id}
                    className={`transition-all ${!productor.estaActivo ? 'bg-gray-50/50 opacity-75' : 'hover:bg-amber-50/30'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
                            productor.estaActivo
                              ? 'bg-gray-900 text-amber-400'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {productor.nombreCompleto.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none mb-1">
                            {productor.nombreCompleto}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                            <MdLocationOn className="mr-1 text-amber-500" size={12} />
                            {productor.direccion || 'SIN DIRECCIÓN'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter mb-0.5">
                        {productor.tipoIdentificacion}
                      </div>
                      <div className="text-[13px] text-gray-700 font-mono font-bold tracking-tight">
                        {productor.numeroIdentificacion}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          productor.estaActivo
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-red-50 text-red-400 border-red-100'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${productor.estaActivo ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}
                        ></span>
                        {productor.estaActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {productor.estaActivo ? (
                          <>
                            <button
                              onClick={() => handleVerLiquidaciones(productor.id)}
                              className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                              title="Ver Ventas/Liquidaciones"
                            >
                              <MdReceiptLong size={20} />
                            </button>
                            <button
                              onClick={() => handleOpenModal(true, productor)}
                              className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                              title="Editar Productor"
                            >
                              <FaUserEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(productor.id)}
                              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                              title="Eliminar"
                            >
                              <MdDelete size={20} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(productor.id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          >
                            <FaTrashRestore size={14} /> Restaurar Productor
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- VISTA MÓVIL --- */}
          <div className="md:hidden divide-y divide-gray-50">
            {currentProductores.map((productor) => (
              <div
                key={productor.id}
                className={`p-6 ${!productor.estaActivo ? 'bg-gray-50 opacity-80' : 'bg-white'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                        productor.estaActivo
                          ? 'bg-gray-900 text-amber-400'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {productor.nombreCompleto.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                        {productor.nombreCompleto}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                        {productor.numeroIdentificacion}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${productor.estaActivo ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-400'}`}
                  ></span>
                </div>
                <div className="flex gap-2">
                  {productor.estaActivo ? (
                    <>
                      <button
                        onClick={() => handleVerLiquidaciones(productor.id)}
                        className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Ventas
                      </button>
                      <button
                        onClick={() => handleOpenModal(true, productor)}
                        className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(productor.id)}
                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Borrar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(productor.id)}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaTrashRestore /> Recuperar Productor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* --- CONTROLES DE PAGINACIÓN --- */}
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> -{' '}
              <span className="text-gray-900">{Math.min(indexOfLastItem, productores.length)}</span>{' '}
              de <span className="text-gray-900">{productores.length}</span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl border-2 border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all shadow-sm"
              >
                <MdChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)]
                  .map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all ${
                        currentPage === i + 1
                          ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600 translate-y-[-2px]'
                          : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-amber-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))
                  .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl border-2 border-gray-100 bg-white text-gray-400 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all shadow-sm"
              >
                <MdChevronRight size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductoresTable
