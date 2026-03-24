import { useEffect } from 'react'
import { FaUserEdit, FaPrint, FaIdCard } from 'react-icons/fa'
import { MdDelete, MdPayments, MdPhone, MdInbox } from 'react-icons/md'

const NominaTable = ({
  fetching,
  activeTab,
  data,
  handleOpenPago,
  handleEdit,
  handleDelete,
  handleImprimir,
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
      {fetching ? (
        <div className="px-6 py-20 text-center animate-pulse text-gray-300 font-black uppercase text-xs tracking-widest">
          Sincronizando nómina...
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <MdInbox size={60} className="mx-auto text-gray-100 mb-4" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
            No se encontraron registros
          </p>
        </div>
      ) : (
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
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/20 transition-colors group">
                  {/* COLUMNA 1: INFO PRINCIPAL */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center font-black text-sm uppercase shadow-sm italic">
                        {(item.nombreCompleto || item.Persona?.nombreCompleto).charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                          {activeTab === 'empleados' ? item.nombreCompleto : item.codigo}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                          {activeTab === 'empleados' ? (
                            <>
                              <MdPhone className="text-amber-500/50" /> {item.telefono}
                            </>
                          ) : (
                            new Date(item.createdAt).toLocaleDateString()
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* COLUMNA 2: IDENTIFICACIÓN O BENEFICIARIO */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs font-bold text-gray-600">
                        <FaIdCard className="mr-2 text-amber-500/50" />
                        <span className="font-mono">
                          {activeTab === 'empleados'
                            ? item.numeroIdentificacion
                            : item.Persona.nombreCompleto}
                        </span>
                      </div>
                      {activeTab === 'empleados' && (
                        <span className="text-[9px] font-black text-amber-600 uppercase mt-1 ml-6 tracking-tighter">
                          {item.tipoIdentificacion}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* COLUMNA 3: ESTADO O MONTO */}
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
                    <div className="flex justify-end gap-2">
                      {activeTab === 'empleados' ? (
                        <>
                          <button
                            onClick={() => handleOpenPago(item)}
                            className="bg-amber-400/10 text-amber-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-amber-950 transition-all border border-amber-200"
                          >
                            <MdPayments size={14} className="inline mr-1" /> Pagar
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                          >
                            <FaUserEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <MdDelete size={20} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleImprimir(item)}
                          className="p-2.5 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 transition-all shadow-md active:scale-95"
                        >
                          <FaPrint size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default NominaTable
