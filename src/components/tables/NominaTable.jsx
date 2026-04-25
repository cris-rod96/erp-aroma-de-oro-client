import { useEffect, useState } from 'react'
import { FaIdCard, FaPrint, FaTrashRestore, FaUserEdit } from 'react-icons/fa'
import {
  MdCake,
  MdChevronLeft,
  MdChevronRight,
  MdDelete,
  MdInbox,
  MdPayments,
  MdPhone,
  MdSecurity,
} from 'react-icons/md'

const NominaTable = ({
  fetching,
  activeTab,
  data = [],
  handleOpenPago,
  handleEdit,
  handleDelete,
  handleImprimir,
  handleRestore,
  error,
  cumplesHoy,
  cumplesManana,
  handleDespedirTrabajador,
}) => {
  // --- LÓGICA DE PAGINACIÓN (IGUAL A INVENTARIO) ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // Ajustado a 8 como en inventario

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear página al cambiar de pestaña o si la data cambia
  useEffect(() => {
    setCurrentPage(1)
    console.log(cumplesHoy, cumplesManana)
  }, [activeTab, data.length])

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {fetching ? (
        <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
          Sincronizando nómina...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-2xl">
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
      ) : data.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            No se encontraron registros
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {activeTab === 'empleados' ? 'Trabajador' : 'Código / Fecha'}
                  </th>

                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {activeTab === 'empleados' ? 'Identificación' : 'Beneficiario'}
                  </th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {activeTab === 'empleados' ? 'Estado' : 'Monto Pagado'}
                  </th>
                  <th className="px-6 py-5  text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Acciones
                  </th>
                  {activeTab === 'empleados' && (
                    <th className="px-6 py-5  text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                    {/* INFO PRINCIPAL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase shadow-sm italic">
                          {(item.nombreCompleto || item.Persona?.nombreCompleto || '?').charAt(0)}
                        </div>
                        <div className="ml-4 flex flex-col">
                          {/* CONTENEDOR DEL NOMBRE Y BADGE */}
                          <div className="flex items-center gap-2 leading-none">
                            <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                              {activeTab === 'empleados' ? item.nombreCompleto : item.codigo}
                            </span>

                            {activeTab === 'empleados' && (
                              <div className="flex gap-1">
                                {cumplesHoy?.find((c) => c.id === item.id) && (
                                  <span className="flex items-center gap-1 bg-amber-500 text-white px-1.5 py-0.5 rounded-md text-[7px] font-black animate-bounce shadow-sm uppercase">
                                    <MdCake size={8} /> Hoy
                                  </span>
                                )}
                                {cumplesManana?.find((c) => c.id === item.id) && (
                                  <span className="flex items-center gap-1 bg-blue-50 text-blue-500 border border-blue-100 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase italic">
                                    <MdCake size={8} /> Mañana
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* SUBTEXTO (TELÉFONO / FECHA) */}
                          <div className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1 uppercase">
                            {activeTab === 'empleados' ? (
                              <>
                                <MdPhone className="text-amber-500/50" />
                                {item.telefono || 'S/R'}
                              </>
                            ) : (
                              new Date(item.createdAt).toLocaleDateString('es-EC')
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* IDENTIFICACIÓN */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-xs font-bold text-gray-600">
                          <FaIdCard className="mr-2 text-amber-500/50" />
                          <span className="font-mono">
                            {activeTab === 'empleados'
                              ? item.numeroIdentificacion
                              : item.Persona?.nombreCompleto}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ESTADO / MONTO */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {activeTab === 'empleados' ? (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            item.estaActivo
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}
                        >
                          {item.estaActivo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      ) : (
                        <span className="text-sm font-black text-emerald-700 font-mono italic">
                          ${parseFloat(item.totalPagar).toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        {activeTab === 'empleados' ? (
                          <>
                            {/* Si el empleado está activo, mostramos flujo normal */}
                            {item.estaActivo ? (
                              <>
                                <button
                                  onClick={() => handleOpenPago(item)}
                                  className="bg-gray-900 text-amber-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all border border-gray-700 shadow-lg active:scale-95 italic flex items-center gap-1"
                                >
                                  <MdPayments size={14} /> Pagar
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                  title="Editar Datos"
                                >
                                  <FaUserEdit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Dar de Baja"
                                >
                                  <MdDelete size={20} />
                                </button>
                              </>
                            ) : (
                              /* SI ESTÁ INACTIVO (PAPELERA), MOSTRAMOS RESTAURAR */
                              <button
                                onClick={() => handleRestore(item.id)} // Asegúrate de pasar esta prop al componente
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95 italic"
                              >
                                <FaTrashRestore size={12} /> Restaurar Personal
                              </button>
                            )}
                          </>
                        ) : (
                          /* ACCIONES PARA LA PESTAÑA DE HISTORIAL */
                          <button
                            onClick={() => handleImprimir(item)}
                            className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 transition-all shadow-xl border border-gray-700"
                          >
                            <FaPrint size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    {activeTab === 'empleados' && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest  border border-rose-100 active:scale-95 transition-all duration-300  cursor-pointer"
                          onClick={() => handleDespedirTrabajador(item.id)}
                        >
                          Despedir
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- CONTROLES DE PAGINACIÓN (IDÉNTICO A INVENTARIO) --- */}
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Mostrando <span className="text-gray-900">{indexOfFirstItem + 1}</span> a{' '}
              <span className="text-gray-900">{Math.min(indexOfLastItem, data.length)}</span> de{' '}
              <span className="text-gray-900">{data.length}</span> registros
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
  )
}

export default NominaTable
