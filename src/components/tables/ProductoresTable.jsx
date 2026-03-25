import { useState, useEffect } from 'react'
import { FaCheckCircle, FaTimesCircle, FaUserEdit } from 'react-icons/fa'
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
  error,
}) => {
  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProductores = productores.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(productores.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear a pág 1 si cambian los datos o el filtro externo
  useEffect(() => {
    setCurrentPage(1)
  }, [productores.length])

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {fetching ? (
        <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
          Sincronizando proveedores...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center bg-white py-20 text-center">
          <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
            <MdSecurity size={50} className="text-rose-400" />
          </div>
          <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
            Acceso Restringido
          </h3>
          <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto leading-relaxed">
            {error}
          </p>
        </div>
      ) : productores.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            No hay productores registrados
          </p>
        </div>
      ) : (
        <>
          {/* --- VISTA ESCRITORIO --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Productor
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Identificación
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentProductores.map((productor) => (
                  <tr key={productor.id} className="hover:bg-amber-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-11 w-11 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase">
                          {productor.nombreCompleto.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                            {productor.nombreCompleto}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center mt-1">
                            <MdLocationOn className="mr-1 text-amber-500" />{' '}
                            {productor.direccion || 'Sin dirección registrada'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">
                        {productor.tipoIdentificacion}
                      </div>
                      <div className="text-sm text-gray-700 font-mono font-bold">
                        {productor.numeroIdentificacion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {productor.estaActivo ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>{' '}
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleVerLiquidaciones(productor.id)}
                          className="p-2.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <MdReceiptLong size={20} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(true, productor)}
                          className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <FaUserEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(productor.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <MdDelete size={20} />
                        </button>
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
              <div key={productor.id} className="p-6 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center font-black uppercase text-base shadow-md">
                      {productor.nombreCompleto.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-tight">
                        {productor.nombreCompleto}
                      </div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                        {productor.numeroIdentificacion}
                      </div>
                    </div>
                  </div>
                  {productor.estaActivo ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-300" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerLiquidaciones(productor.id)}
                    className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Ventas
                  </button>
                  <button
                    onClick={() => handleOpenModal(true, productor)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(productor.id)}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- CONTROLES DE PAGINACIÓN --- */}
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest order-2 md:order-1">
              Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> a{' '}
              <span className="text-gray-900">{Math.min(indexOfLastItem, productores.length)}</span>{' '}
              de <span className="text-gray-900">{productores.length}</span> productores
            </p>

            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
              >
                <MdChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)]
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
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductoresTable
